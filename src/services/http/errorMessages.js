/**
 * Traduce un error de la API a una clave de i18n (namespace `errors`).
 *
 * El backend no devuelve códigos estables, solo status y un texto en inglés, así
 * que el mapeo es por operación + status. El texto del servidor (`message`,
 * `error`, `detail`) nunca se usa, ni siquiera como último recurso.
 *
 * Orden: clave de la operación para ese status → sin conexión → `default` de la
 * operación → genérica por status.
 */

/** Claves por operación y status. `default` cubre cualquier otro status. */
const OPERATIONS = {
  login: { 401: "login.invalidCredentials", 403: "login.inactive" },
  register: { 409: "register.emailTaken", 422: "password.policy" },
  passwordReset: { 422: "password.policy", default: "passwordReset.failed" },
  passwordChange: {
    401: "passwordChange.wrongCurrent",
    422: "password.policy",
    default: "passwordChange.failed",
  },
  accountDelete: {
    401: "accountDelete.wrongPassword",
    409: "accountDelete.lastOwner",
    default: "accountDelete.failed",
  },
  homeCreate: { 404: "homeCreate.typeNotFound", 409: "homeCreate.codeCollision" },
  homeJoin: { 404: "homeJoin.codeNotFound", 409: "homeJoin.alreadyMember" },
  homeLeave: { 404: "homeLeave.notMember", 409: "homeLeave.lastOwner" },
  memberRemove: {
    403: "memberRemove.notOwner",
    404: "memberRemove.notFound",
    409: "memberRemove.isOwner",
  },
  thresholdsUpdate: { 400: "thresholdsUpdate.invalid", 403: "thresholdsUpdate.notOwner" },
  deviceLink: {
    403: "deviceLink.notOwner",
    409: "deviceLink.otherHome",
    default: "deviceLink.failed",
  },
  deviceUnlink: { 403: "deviceUnlink.notOwner", default: "deviceUnlink.failed" },
};

const GENERIC = {
  400: "generic.badRequest",
  401: "generic.unauthorized",
  403: "generic.forbidden",
  404: "generic.notFound",
  409: "generic.conflict",
  422: "generic.badRequest",
  429: "generic.rateLimited",
};

/** Status del error: ApiError (`status`) o error crudo de axios (`response.status`). */
function statusOf(error) {
  if (error?.response) return error.response.status ?? null;
  return typeof error?.status === "number" ? error.status : null;
}

/**
 * @param {unknown} error ApiError o error de axios
 * @param {keyof typeof OPERATIONS} [operation] operación que falló
 * @returns {string} clave con namespace, p. ej. "errors:accountDelete.lastOwner"
 */
export function errorMessageKey(error, operation) {
  const status = statusOf(error);
  const specific = OPERATIONS[operation] ?? {};
  const key =
    (status != null && specific[status]) ||
    (status == null && "generic.network") ||
    specific.default ||
    GENERIC[status] ||
    "generic.server";
  return `errors:${key}`;
}

/** Valores de interpolación para la clave (minutos de espera en un 429). */
export function errorMessageValues(error) {
  const seconds = error?.retryAfter ?? 900;
  return { minutes: Math.ceil(seconds / 60) };
}

/**
 * Texto traducido del error, listo para mostrar.
 * @param {(key: string, values?: object) => string} t función `t` de react-i18next
 * @param {unknown} error
 * @param {keyof typeof OPERATIONS} [operation]
 */
export const errorMessage = (t, error, operation) =>
  t(errorMessageKey(error, operation), errorMessageValues(error));
