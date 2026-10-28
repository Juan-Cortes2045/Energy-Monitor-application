/**
 * Sesión del usuario en localStorage, bajo una sola clave: cuenta, perfil, permisos y el id de
 * la sesión del backend. Nada de esto es secreto. Los tokens no pasan por aquí: el servicio de
 * seguridad los entrega en cookies HttpOnly que ningún script puede leer.
 * El id del usuario vive en `session.account.idUser` (login y GET /auth/account).
 */
const KEY = "session";
// Clave suelta que guardaban versiones anteriores para el header X-User-Id.
const LEGACY_USER_ID_KEY = "userId";

export function getSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY));
    // Un valor que no es un objeto (manipulado o de otra versión) cuenta como sin sesión.
    return session && typeof session === "object" ? session : null;
  } catch {
    return null;
  }
}

// Campos que versiones anteriores guardaban aquí: nunca se vuelven a escribir.
const LEGACY_TOKEN_FIELDS = ["accessToken", "refreshToken", "tokenType", "expiresIn"];

/** @param {{account?: {idUser: string}, idUserSession?: string}} s */
export function saveSession(s) {
  const prev = getSession();
  const next = { ...prev, ...s, account: s.account ?? prev?.account };
  LEGACY_TOKEN_FIELDS.forEach((field) => delete next[field]);
  localStorage.setItem(KEY, JSON.stringify(next));
  notify();
}

// Suscripción para que la UI (Sidebar, perfil, rutas protegidas) se actualice al cambiar la
// sesión, también cuando cambia en otra pestaña (evento "storage": login, logout o refresh).
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());
const onStorage = (event) => {
  if (event.key === KEY || event.key === null) notify();
};
export const subscribeSession = (l) => {
  if (listeners.size === 0) globalThis.addEventListener?.("storage", onStorage);
  listeners.add(l);
  return () => {
    listeners.delete(l);
    if (listeners.size === 0) globalThis.removeEventListener?.("storage", onStorage);
  };
};
export const getSessionSnapshot = () => localStorage.getItem(KEY);

/** Id del usuario en sesión (o null): cambia solo al iniciar o cerrar sesión, no al renovar tokens. */
export const getSessionUserId = () => getSession()?.account?.idUser ?? null;

export function clearSession() {
  localStorage.removeItem(KEY);
  notify();
  localStorage.removeItem(LEGACY_USER_ID_KEY); // limpia a quien aún la tenga guardada
}

// Hay sesión mientras se conoce la cuenta; si las cookies ya no valen, la primera petición
// responde 401, la renovación falla y la sesión local se borra.
export const isAuthenticated = () => Boolean(getSession()?.account?.idUser);

/** Id de la sesión del backend que contestó el login (lo pide /auth/logout). */
export const getSessionId = () => getSession()?.idUserSession ?? null;

// Una sesión guardada por una versión anterior trae los tokens en claro: se borran al cargar.
(() => {
  const stored = getSession();
  if (stored && LEGACY_TOKEN_FIELDS.some((field) => field in stored)) {
    LEGACY_TOKEN_FIELDS.forEach((field) => delete stored[field]);
    try {
      localStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
      // Sin almacenamiento: no hay nada que limpiar.
    }
  }
})();

/** Datos del usuario en sesión (el backend no devuelve nombre en GET /auth/account). */
export function getCurrentPerson() {
  const s = getSession();
  if (!s?.account) return null;
  return {
    id: s.account.idUser,
    name: s.profile?.name ?? "",
    lastName: s.profile?.lastName ?? "",
    email: s.account.email ?? "",
    profileImage: s.profile?.profileImage ?? null,
    googleAccount: s.account.googleAccount === true,
  };
}

/**
 * Permisos globales guardados en la sesión, o `null` mientras aún no se han
 * pedido (sesiones de antes de que existieran).
 */
export function getPermissions() {
  const permissions = getSession()?.permissions;
  return Array.isArray(permissions) ? permissions : null;
}

/** Permiso que hace de una cuenta una cuenta de administración (rol global ADMIN). */
export const ADMIN_PERMISSION = "USER.READ";

/** Adónde llevar al usuario al iniciar sesión: los administradores, a la administración. */
export function landingPath() {
  return getPermissions()?.includes(ADMIN_PERMISSION) ? "/admin/users" : "/dashboard";
}
