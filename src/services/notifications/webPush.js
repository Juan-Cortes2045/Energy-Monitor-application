import { getPushPublicKey, removePushSubscription, savePushSubscription } from "./notificationApi";

/**
 * Notificaciones push del navegador (Push API + service worker).
 *
 * Funciona en Chrome, Edge y Firefox (escritorio y Android) y en Safari 16.4+; en iPhone solo
 * si la web está instalada en la pantalla de inicio. Exige HTTPS o localhost.
 *
 * Brave trae la Push API pero con el servicio de mensajería de Google apagado: pedir el permiso
 * funciona y la suscripción falla con un AbortError. No se puede arreglar desde la web; se detecta
 * y se le indica a la persona cómo activarlo (brave://settings/privacy).
 */

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext !== false &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** ¿Es Brave? Expone `navigator.brave.isBrave()`. */
export async function isBraveBrowser() {
  try {
    return (await globalThis.navigator?.brave?.isBrave?.()) === true;
  } catch {
    return false;
  }
}

/** "granted" | "denied" | "default" | "unsupported" */
export function pushPermission() {
  return isPushSupported() ? Notification.permission : "unsupported";
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js");
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

/** ¿Este navegador ya está suscrito? */
export async function isThisBrowserSubscribed() {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  return !!(await reg?.pushManager.getSubscription());
}

/**
 * Pide permiso, suscribe este navegador y lo registra en el backend.
 * @returns {Promise<"subscribed"|"denied"|"unsupported"|"unavailable"|"serviceBlocked"|"braveBlocked">}
 *   `serviceBlocked`: el navegador no pudo registrarse en su servicio push (red, bloqueo o ajustes);
 *   `braveBlocked`: lo mismo en Brave, que lo trae apagado por defecto.
 */
export async function subscribeThisBrowser() {
  if (!isPushSupported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  const publicKey = await getPushPublicKey();
  if (!publicKey) return "unavailable";

  const reg = await registration();
  await navigator.serviceWorker.ready;
  let subscription = await reg.pushManager.getSubscription();
  const key = base64UrlToBytes(publicKey);
  // Una suscripción hecha con otra clave del servidor ya no sirve: se rehace.
  const current = subscription?.options?.applicationServerKey;
  if (subscription && current && !sameBytes(new Uint8Array(current), key)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    try {
      subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    } catch (error) {
      // AbortError "push service error": el navegador no llegó a su servicio de mensajería.
      if (error?.name !== "AbortError" && error?.name !== "NotAllowedError" && error?.name !== "InvalidStateError") {
        throw error;
      }
      return (await isBraveBrowser()) ? "braveBlocked" : "serviceBlocked";
    }
  }
  await savePushSubscription(subscription.toJSON());
  return "subscribed";
}

/**
 * Da de baja este navegador (en el backend y en el navegador). La baja del navegador ocurre
 * aunque falle la del backend: este navegador deja de recibir avisos igualmente.
 * @param {object} [config] opciones de axios para la llamada al backend
 */
export async function unsubscribeThisBrowser(config) {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;
  await removePushSubscription(subscription.endpoint, config).catch(() => {});
  await subscription.unsubscribe();
}

function sameBytes(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
