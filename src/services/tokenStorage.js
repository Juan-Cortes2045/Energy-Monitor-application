// Single source of truth for where auth tokens live in the browser. Both
// src/services/api.js (attaches/refreshes them) and AuthContext (reads them
// on login/logout) go through here so the storage keys only exist once.

const ACCESS_TOKEN_KEY = "energy_monitor_access_token";
const REFRESH_TOKEN_KEY = "energy_monitor_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

export function clearTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}
