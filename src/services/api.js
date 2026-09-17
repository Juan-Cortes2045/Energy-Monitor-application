import axios from "axios";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "./tokenStorage";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalizes any axios error into { status, code, message } so screens never
// have to reach into error.response.data themselves.
function normalizeError(error) {
  if (error.response) {
    const { status, data } = error.response;
    return { status, code: data?.code ?? "UNKNOWN_ERROR", message: data?.message ?? error.message };
  }
  if (error.request) {
    return { status: 0, code: "NETWORK_ERROR", message: "Could not reach the server" };
  }
  return { status: 0, code: "UNKNOWN_ERROR", message: error.message };
}

// A request cancelled via AbortController must reach the caller as-is (with
// axios's own error.code === "ERR_CANCELED") so hooks can tell "the user
// navigated away" apart from a real failure — never normalize it away.
function isCancelled(error) {
  return axios.isCancel(error) || error.code === "ERR_CANCELED";
}

// AuthContext listens for this to clear its state and let ProtectedRoute's
// <Navigate to="/login"> do the actual redirect — a plain
// window.location assignment would work too, but throws away SPA state.
function broadcastSessionExpired() {
  clearTokens();
  window.dispatchEvent(new Event("auth:logout"));
}

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");
  // Plain axios, not the `api` instance: must not go through these same
  // interceptors, or a failed refresh would recursively trigger itself.
  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  setAccessToken(response.data.accessToken);
  return response.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isCancelled(error)) return Promise.reject(error);

    const { config, response } = error;
    const isAuthEndpoint = config?.url?.includes("/auth/");

    if (response?.status === 401 && !config._retriedAfterRefresh && !isAuthEndpoint) {
      config._retriedAfterRefresh = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(config);
      } catch {
        refreshPromise = null;
        broadcastSessionExpired();
        return Promise.reject(normalizeError(error));
      }
    }

    if (response?.status === 401) {
      broadcastSessionExpired();
    }

    // 403 (forbidden) is intentionally not special-cased here: it still
    // comes back as a normalized { status: 403, code, message } and the
    // calling screen decides how to show "you don't have permission".
    return Promise.reject(normalizeError(error));
  },
);

export default api;
