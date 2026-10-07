/**
 * Modelo de error común de los módulos de la API.
 * Toda función del cliente de API resuelve con los datos o lanza
 * un ApiError con esta forma.
 *
 * @typedef {{ status: number | null, message: string }} ApiErrorShape
 */

export class ApiError extends Error {
  /**
   * @param {number | null} status HTTP status (null si no hubo respuesta)
   * @param {string} message mensaje legible para el usuario
   */
  constructor(status, message, retryAfter = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    /** Segundos de espera pedidos por el servidor (429). */
    this.retryAfter = retryAfter;
  }
}

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "No se pudo identificar tu usuario. Vuelve a ingresar.",
  FORBIDDEN: "No tienes permisos para realizar esta acción en este hogar.",
  NOT_FOUND: "No se encontró el hogar, el código de acceso o la membresía.",
  CONFLICT: "La operación entra en conflicto con el estado actual del hogar.",
  RATE_LIMIT: "Demasiados intentos. Espera antes de volver a intentarlo.",
  SERVER: "Ocurrió un error inesperado. Intenta de nuevo.",
  NETWORK: "No se pudo conectar con el servidor. Revisa tu conexión.",
};

/**
 * Convierte cualquier error de axios/red en un ApiError consistente.
 * El cuerpo de error del backend siempre tiene forma { "error": "mensaje" }.
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
      return new ApiError(429, ERROR_MESSAGES.RATE_LIMIT, wait > 0 ? wait : 900);
    }
    const serverMessage =
      err.response.data && typeof err.response.data === "object"
        ? (err.response.data.message ?? err.response.data.error)
        : undefined;

    if (typeof serverMessage === "string" && serverMessage.trim() !== "") {
      return new ApiError(status, serverMessage);
    }

    switch (status) {
      case 400:
        return new ApiError(400, "Los datos enviados no son válidos.");
      case 401:
        return new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        return new ApiError(403, ERROR_MESSAGES.FORBIDDEN);
      case 404:
        return new ApiError(404, ERROR_MESSAGES.NOT_FOUND);
      case 409:
        return new ApiError(409, ERROR_MESSAGES.CONFLICT);
      default:
        return new ApiError(status, ERROR_MESSAGES.SERVER);
    }
  }

  if (err && typeof err === "object" && ("request" in err || err.code === "ERR_NETWORK")) {
    return new ApiError(null, ERROR_MESSAGES.NETWORK);
  }

  return new ApiError(null, ERROR_MESSAGES.SERVER);
}
