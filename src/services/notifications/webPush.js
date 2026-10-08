import { getPushPublicKey, removePushSubscription, savePushSubscription } from "./notificationApi";

/**
 * Notificaciones push del navegador (Push API + service worker).
 *
 * Funciona en Chrome, Edge y Firefox (escritorio y Android) y en Safari 16.4+; en iPhone solo
 * si la web está instalada en la pantalla de inicio. Exige HTTPS o localhost.
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
 * @returns {Promise<"subscribed"|"denied"|"unsupported"|"unavailable">}
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
  subscription ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
  await savePushSubscription(subscription.toJSON());
  return "subscribed";
}

/** Da de baja este navegador (en el backend y en el navegador). */
export async function unsubscribeThisBrowser() {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = await reg?.pushManager.getSubscription();
  if (!subscription) return;
  await removePushSubscription(subscription.endpoint).catch(() => {});
  await subscription.unsubscribe();
}

function sameBytes(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
