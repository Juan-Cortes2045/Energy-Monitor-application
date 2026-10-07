import axios from "axios";
import { normalizeError } from "./errors";
import {
  clearSession,
  getSession,
  saveSession,
} from "../auth/session";

/** Origen del backend; la ruta /api/v1 es fija. */
export const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
}/api/v1`;

/**
 * Instancia HTTP única.
 * - Interceptor de request: añade Authorization en un solo lugar. El backend
 *   identifica al usuario por el `sub` del JWT; no se envía ninguna cabecera de id.
 * - Interceptor de response: renueva el access token (una sola vez a la vez)
 *   y traduce errores al modelo común.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Endpoints públicos de autenticación: no llevan credenciales, porque una sesión
// guardada que ya no vale (token vencido o cuenta borrada) haría fallar el registro
// o el login con 401. Ahí un 401 significa "credenciales/código malos", no "token vencido".
const PUBLIC_AUTH =
  /\/auth\/(login|register|refresh|password\/(forgot|reset)|email\/(verify|verification\/resend))$/;

httpClient.interceptors.request.use((config) => {
  if (PUBLIC_AUTH.test(config.url ?? "")) return config;
  const token = getSession()?.accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

/**
 * Renueva los tokens. El refresh token rota y el backend revoca toda la familia
 * si se reutiliza uno ya gastado, así que: una sola llamada en curso, el token
 * se lee del almacenamiento justo antes de enviarlo, y entre pestañas se
 * serializa con Web Locks (sin ellos, solo hay protección dentro de la pestaña).
 * @param {string | undefined} staleAccess access token con el que falló la petición
 */
function refreshTokens(staleAccess) {
  refreshing ??= (async () => {
    const run = async () => {
      const current = getSession();
      if (!current?.refreshToken) throw new Error("sin sesión");
      // Otra pestaña (o petición) ya renovó mientras esperábamos el bloqueo.
      if (staleAccess && current.accessToken !== staleAccess) return;
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: current.refreshToken,
      });
      // Si hubo logout mientras tanto, no resucitar la sesión.
      if (getSession()?.refreshToken !== current.refreshToken) return;
      saveSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    };
    return globalThis.navigator?.locks
      ? navigator.locks.request("auth-refresh", run)
      : run();
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

let redirecting = false;

function toLogin() {
  clearSession();
  if (!redirecting && globalThis.location.pathname !== "/login") {
    redirecting = true;
    globalThis.location.assign("/login");
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (
      response?.status === 401 &&
      config &&
      !config._retry &&
      !PUBLIC_AUTH.test(config.url ?? "") &&
      getSession()?.refreshToken
    ) {
      config._retry = true;
      const stale = config.headers?.Authorization?.replace("Bearer ", "");
      try {
        await refreshTokens(stale);
      } catch (refreshError) {
        // Sin respuesta (red caída) no se cierra la sesión: el token sigue siendo válido.
        if (refreshError.response || refreshError.message === "sin sesión") {
          toLogin();
        }
        return Promise.reject(normalizeError(refreshError.response ? error : refreshError));
      }
      if (!getSession()) return Promise.reject(normalizeError(error));
      delete config.headers.Authorization; // el interceptor pone el nuevo
      return httpClient(config);
    }
    return Promise.reject(normalizeError(error));
  },
);
