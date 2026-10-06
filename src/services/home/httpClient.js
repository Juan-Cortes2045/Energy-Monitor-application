import axios from "axios";
import { getCurrentUserId } from "./currentUser";
import { normalizeError } from "./errors";

/**
 * Instancia HTTP única.
 * - Interceptor de request: añade X-User-Id en un solo lugar.
 * - Interceptor de response: traduce errores al modelo común.
 */
export const httpClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const userId = getCurrentUserId();
  if (userId) {
    config.headers["X-User-Id"] = userId;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);
