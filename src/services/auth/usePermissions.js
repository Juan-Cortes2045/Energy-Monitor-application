import { useMemo, useSyncExternalStore } from "react";
import { ADMIN_PERMISSION, getPermissions, getSessionSnapshot, subscribeSession } from "./session";

/**
 * Permisos globales del usuario en sesión, actualizados al cambiar la sesión.
 * `loaded` es false hasta que llega la primera respuesta de GET /auth/permissions.
 * `isAdmin`: la cuenta tiene el rol global ADMIN y solo ve la administración.
 *
 * @returns {{ loaded: boolean, isAdmin: boolean, has: (code: string) => boolean }}
 */
export function usePermissions() {
  const raw = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  return useMemo(() => {
    const permissions = getPermissions();
    return {
      loaded: permissions !== null,
      isAdmin: Boolean(permissions?.includes(ADMIN_PERMISSION)),
      has: (code) => Boolean(permissions?.includes(code)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `raw` es la huella de la sesión
  }, [raw]);
}
