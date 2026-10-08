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

export async function removePushSubscription(endpoint) {
  await httpClient.post("/notifications/push/subscriptions/remove", { endpoint });
}
