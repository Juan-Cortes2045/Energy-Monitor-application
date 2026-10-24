import axios from "axios";
import { normalizeError } from "./errors";
import { clearSession, getSession } from "../auth/session";

/**
 * Origen del backend; la ruta /api/v1 es fija. Vacío (el valor por defecto) = el mismo origen
 * de la web: nginx en la pila de Docker y el proxy de Vite en desarrollo reenvían /api al
 * gateway. Una barra final en la variable no duplica "//".
 */
export const API_BASE_URL = `${(import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "")}/api/v1`;

/**
 * Cabeceras de la sesión en cookies HttpOnly. El servicio de seguridad entrega los tokens en
 * cookies que ningún script puede leer (X-Session-Transport) y el gateway solo usa la cookie de
 * acceso si la petición trae X-Requested-With, que un formulario o una imagen de otro sitio no
 * pueden enviar (protección CSRF).
 */
const SESSION_HEADERS = {
  "X-Requested-With": "XMLHttpRequest",
  "X-Session-Transport": "cookie",
};

/**
 * Instancia HTTP única.
 * - Las credenciales viajan solas, en las cookies; aquí no se adjunta ningún token.
 * - Interceptor de response: renueva la sesión (una sola vez a la vez) y traduce errores al
 *   modelo común.
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", ...SESSION_HEADERS },
  withCredentials: true,
});

// Endpoints públicos de autenticación: ahí un 401 significa "credenciales/código malos", no
// "sesión vencida", así que no se intenta renovar.
const PUBLIC_AUTH =
  /\/auth\/(login|google|register|refresh|password\/(forgot|reset)|email\/(verify|verification\/resend))$/;

// Una URL absoluta a otro origen no recibe las cookies ni las cabeceras de la sesión (axios
// ignora baseURL con URLs absolutas).
const isOtherOrigin = (url) =>
  /^([a-z][a-z\d+.-]*:)?\/\//i.test(url) && !url.startsWith(API_BASE_URL);

httpClient.interceptors.request.use((config) => {
  if (isOtherOrigin(config.url ?? "")) {
    config.withCredentials = false;
    Object.keys(SESSION_HEADERS).forEach((name) => config.headers.delete?.(name));
  }
  config._sentAt ??= Date.now();
  return config;
});

// Momento de la última renovación, compartido entre pestañas: una petición que falló antes de
// esa renovación solo necesita reintentarse con las cookies nuevas.
const REFRESHED_AT_KEY = "sessionRefreshedAt";
const lastRefresh = () => Number(localStorage.getItem(REFRESHED_AT_KEY)) || 0;

let refreshing = null;

/**
 * Renueva la sesión con la cookie de refresh. El refresh token rota y el backend revoca toda la
 * familia si se reutiliza uno ya gastado, así que: una sola llamada en curso y, entre pestañas,
 * serializada con Web Locks (sin ellos, solo hay protección dentro de la pestaña).
 * @param {number | undefined} sentAt cuándo salió la petición que respondió 401
 */
function refreshTokens(sentAt) {
  refreshing ??= (async () => {
    const run = async () => {
      // Otra pestaña (o petición) ya renovó después de que saliera la petición fallida.
      if (sentAt && lastRefresh() > sentAt) return;
      await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
        headers: SESSION_HEADERS,
        withCredentials: true,
      });
      localStorage.setItem(REFRESHED_AT_KEY, String(Date.now()));
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
    // `_sessionEnding`: las llamadas del cierre de sesión, que salen cuando la sesión local ya
    // se borró pero aún necesitan las cookies (y renovarlas si vencieron).
    if (
      response?.status === 401 &&
      config &&
      !config._retry &&
      !PUBLIC_AUTH.test(config.url ?? "") &&
      (getSession() || config._sessionEnding)
    ) {
      config._retry = true;
      try {
        await refreshTokens(config._sentAt);
      } catch (refreshError) {
        // Sin respuesta (red caída) no se cierra la sesión: las cookies siguen siendo válidas.
        if (refreshError.response && !config._sessionEnding) toLogin();
        return Promise.reject(normalizeError(refreshError.response ? error : refreshError));
      }
      // Si hubo logout mientras tanto, no se reintenta: la sesión no debe revivir.
      if (!getSession() && !config._sessionEnding) return Promise.reject(normalizeError(error));
      return httpClient(config);
    }
    return Promise.reject(normalizeError(error));
  },
);
