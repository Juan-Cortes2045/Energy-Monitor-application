import { httpClient } from "../http/httpClient";

/**
 * Cliente de la API de administración (/admin). Cada ruta exige un permiso
 * global que el backend comprueba; la web solo oculta lo que no se puede usar.
 * Todas las funciones devuelven datos o lanzan ApiError.
 */

/** Códigos de permiso que usa la administración (contrato estable del backend). */
export const PERMISSIONS = {
  USER_READ: "USER.READ",
  USER_MANAGE: "USER.MANAGE",
  ROLE_MANAGE: "ROLE.MANAGE",
};

/**
 * @param {{ q?: string, page?: number, size?: number }} params
 * @returns {Promise<{ items: object[], page: number, size: number, totalItems: number }>}
 */
export async function listUsers({ q, page = 0, size = 20 } = {}) {
  const params = { page, size };
  if (q?.trim()) params.q = q.trim();
  const { data } = await httpClient.get("/admin/users", { params });
  return data;
}

/** @returns {Promise<{ name: string, description: string | null }[]>} */
export async function listRoles() {
  const { data } = await httpClient.get("/admin/roles");
  return data;
}

/** @param {"ACTIVE" | "INACTIVE" | "BLOCKED"} status */
export async function changeUserStatus(idUser, status) {
  await httpClient.put(`/admin/users/${encodeURIComponent(idUser)}/status`, { status });
}

export async function grantRole(idUser, roleName) {
  await httpClient.put(
    `/admin/users/${encodeURIComponent(idUser)}/roles/${encodeURIComponent(roleName)}`,
  );
}

export async function revokeRole(idUser, roleName) {
  await httpClient.delete(
    `/admin/users/${encodeURIComponent(idUser)}/roles/${encodeURIComponent(roleName)}`,
  );
}

/**
 * Notificaciones de administrador del usuario en sesión, más recientes primero.
 * @returns {Promise<{ id: string, messageKey: string, subjectUserId: string,
 *   subjectName: string | null, subjectEmail: string | null, createdAt: string, read: boolean }[]>}
 */
export async function listAdminNotifications() {
  const { data } = await httpClient.get("/admin/notifications");
  return data;
}

export async function markAdminNotificationRead(id) {
  await httpClient.put(`/admin/notifications/${encodeURIComponent(id)}/read`);
}

export async function deleteAdminNotification(id) {
  await httpClient.delete(`/admin/notifications/${encodeURIComponent(id)}`);
}
