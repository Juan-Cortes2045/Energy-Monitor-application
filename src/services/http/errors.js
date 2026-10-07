/**
 * Modelo de error común de los módulos de la API.
 * Toda función del cliente de API resuelve con los datos o lanza
 * un ApiError con esta forma.
 *
 * El texto que se muestra al usuario NO viaja aquí: sale de i18n con
 * `errorMessageKey` (./errorMessages.js). El cuerpo del backend se descarta.
 *
 * @typedef {{ status: number | null, message: string }} ApiErrorShape
 */

export class ApiError extends Error {
  /**
   * @param {number | null} status HTTP status (null si no hubo respuesta)
   * @param {string} message descripción técnica para logs; nunca se muestra
   */
  constructor(status, message, retryAfter = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    /** Segundos de espera pedidos por el servidor (429). */
    this.retryAfter = retryAfter;
  }
}

/**
 * Convierte cualquier error de axios/red en un ApiError consistente.
 * Solo conserva el status (y Retry-After en un 429).
 *
 * @param {unknown} err
 * @returns {ApiError}
 */
export function normalizeError(err) {
  if (err instanceof ApiError) return err;

  if (err && typeof err === "object" && "response" in err && err.response) {
    const status = err.response.status ?? null;

    // El backend fija Retry-After en 900 s, pero el navegador solo lo lee si el
    // servidor lo expone por CORS; si no, se usa ese mismo valor.
    if (status === 429) {
      const wait = Number(err.response.headers?.["retry-after"]);
      return new ApiError(429, "HTTP 429", wait > 0 ? wait : 900);
    }
    return new ApiError(status, `HTTP ${status}`);
  }

  if (err && typeof err === "object" && ("request" in err || err.code === "ERR_NETWORK")) {
    return new ApiError(null, "Network error");
  }

  return new ApiError(null, "Unexpected error");
}
