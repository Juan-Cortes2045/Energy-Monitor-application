import { httpClient } from "../http/httpClient";

/**
 * Preferencias de canales del usuario y suscripciones push.
 * Todas las funciones devuelven datos o lanzan ApiError.
 */

/** @returns {Promise<{emailEnabled: boolean, pushEnabled: boolean, pushAvailable: boolean, pushBrowsers: number}>} */
export async function getPreferences() {
  const { data } = await httpClient.get("/notifications/preferences");
  return data;
}

/** @param {{emailEnabled: boolean, pushEnabled: boolean}} preferences */
export async function updatePreferences(preferences) {
  const { data } = await httpClient.put("/notifications/preferences", preferences);
  return data;
}

/** Clave pública VAPID; null si el servidor no tiene push configurado (404). */
export async function getPushPublicKey() {
  try {
    const { data } = await httpClient.get("/notifications/push/public-key");
    return data.publicKey;
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

/** @param {PushSubscriptionJSON} subscription */
export async function savePushSubscription(subscription) {
  await httpClient.post("/notifications/push/subscriptions", {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
  });
}

/** @param {object} [config] opciones de axios (el cierre de sesión pasa las suyas) */
export async function removePushSubscription(endpoint, config) {
  await httpClient.post("/notifications/push/subscriptions/remove", { endpoint }, config);
}

/**
 * Notificaciones de actividad del usuario: bienvenida, hogares (creado, miembros, umbrales,
 * propietario, eliminado) y dispositivos vinculados o desvinculados.
 *
 * @param {string} [homeId] solo las de ese hogar; sin él, todas (también las de la cuenta)
 * @returns {Promise<Array<{id: string, source: string, messageKey: string, homeId: string|null,
 *   params: Object<string, string>, createdAt: string, read: boolean}>>}
 */
export async function listActivity(homeId) {
  const { data } = await httpClient.get("/notifications/activity", {
    params: homeId ? { homeId } : undefined,
  });
  return data;
}

export async function markActivityRead(id) {
  await httpClient.put(`/notifications/activity/${id}/read`);
}

/** @param {string} [homeId] solo las de ese hogar; sin él, todas */
export async function markAllActivityRead(homeId) {
  const { data } = await httpClient.put("/notifications/activity/read", null, {
    params: homeId ? { homeId } : undefined,
  });
  return data.read;
}

export async function deleteActivity(id) {
  await httpClient.delete(`/notifications/activity/${id}`);
}

/**
 * Adapta una notificación de actividad a la forma que usa la bandeja.
 *
 * La clave del texto es la del servidor sin su versión ("activity.home.member-joined.v1" pasa a
 * "activity.home.member-joined"). El nombre del hogar viene en la notificación, que lo guardó
 * cuando ocurrió; si falta, se usa el de la lista de hogares del usuario.
 *
 * @param {object} n notificación de GET /notifications/activity
 * @param {Map<string, string>} [homeNames] nombre de cada hogar del usuario por id
 */
export function toUiActivity(n, homeNames = new Map()) {
  const params = n.params ?? {};
  return {
    id: n.id,
    kind: "activity",
    source: n.source,
    severity: "info",
    key: n.messageKey.replace(/\.v\d+$/, ""),
    homeId: n.homeId,
    home: params.homeName ?? (n.homeId ? homeNames.get(n.homeId) : undefined),
    device: params.deviceName,
    actor: params.actorName,
    subject: params.subjectName,
    date: n.createdAt,
    read: n.read,
  };
}
