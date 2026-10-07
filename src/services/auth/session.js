/**
 * Sesión del usuario (tokens + idUser) en localStorage.
 * `userId` se guarda con esa clave porque services/http/currentUser.js la lee
 * para el header X-User-Id que aún exige el módulo de hogares.
 */
const KEY = "session";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? null;
  } catch {
    return null;
  }
}

/** @param {{accessToken: string, refreshToken: string, account?: {idUser: string}}} s */
export function saveSession(s) {
  const prev = getSession();
  const next = { ...prev, ...s, account: s.account ?? prev?.account };
  localStorage.setItem(KEY, JSON.stringify(next));
  if (next.account?.idUser) localStorage.setItem("userId", next.account.idUser);
}

export function clearSession() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("userId");
}

export const isAuthenticated = () => Boolean(getSession()?.accessToken);

/** El `sub` del access token es el id de la sesión (lo pide /auth/logout). */
export function getSessionId() {
  try {
    const payload = getSession().accessToken.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).sub;
  } catch {
    return null;
  }
}
