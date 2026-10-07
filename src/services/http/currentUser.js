/**
 * ÚNICO lugar donde se resuelve la identidad temporal del usuario.
 *
 * Hoy el backend exige el header X-User-Id (solución temporal e insegura).
 * El módulo de seguridad reemplazará este proveedor por el id/token real;
 * ningún otro archivo debe leer identidad directamente.
 */

let currentUserIdProvider = () => {
  try {
    return globalThis.localStorage?.getItem("userId") ?? null;
  } catch {
    return null;
  }
};

/**
 * Permite al módulo de seguridad (o a tests) inyectar el proveedor real.
 * @param {() => string | null} provider
 */
export function setCurrentUserIdProvider(provider) {
  currentUserIdProvider = provider;
}

/** @returns {string | null} */
export function getCurrentUserId() {
  return currentUserIdProvider();
}
