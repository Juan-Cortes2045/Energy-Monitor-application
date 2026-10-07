import { describe, it, expect } from "vitest";
import { ApiError, normalizeError } from "./errors";
import { errorMessage, errorMessageKey, errorMessageValues } from "./errorMessages";

const SERVER_TEXT = "You are the only owner of a home that still has other members.";
const axiosError = (status, data = { message: SERVER_TEXT, error: SERVER_TEXT }) => ({
  response: { status, data, headers: {} },
});

describe("errorMessageKey", () => {
  it.each([
    ["accountDelete", 401, "errors:accountDelete.wrongPassword"],
    ["accountDelete", 409, "errors:accountDelete.lastOwner"],
    ["login", 401, "errors:login.invalidCredentials"],
    ["login", 403, "errors:login.inactive"],
    ["register", 409, "errors:register.emailTaken"],
    ["register", 422, "errors:password.policy"],
    ["passwordChange", 422, "errors:password.policy"],
    ["homeJoin", 404, "errors:homeJoin.codeNotFound"],
    ["homeLeave", 409, "errors:homeLeave.lastOwner"],
    ["memberRemove", 409, "errors:memberRemove.isOwner"],
    ["thresholdsUpdate", 403, "errors:thresholdsUpdate.notOwner"],
  ])("%s + %i → %s", (operation, status, key) => {
    expect(errorMessageKey(new ApiError(status, "x"), operation)).toBe(key);
  });

  it("acepta también el error crudo de axios", () => {
    expect(errorMessageKey(axiosError(409), "accountDelete")).toBe(
      "errors:accountDelete.lastOwner",
    );
  });

  it("status no mapeado en la operación usa su `default`", () => {
    expect(errorMessageKey(new ApiError(500, "x"), "accountDelete")).toBe(
      "errors:accountDelete.failed",
    );
  });

  it.each([
    [400, "errors:generic.badRequest"],
    [401, "errors:generic.unauthorized"],
    [403, "errors:generic.forbidden"],
    [404, "errors:generic.notFound"],
    [409, "errors:generic.conflict"],
    [422, "errors:generic.badRequest"],
    [429, "errors:generic.rateLimited"],
    [500, "errors:generic.server"],
    [503, "errors:generic.server"],
    [418, "errors:generic.server"],
  ])("fallback genérico: %i → %s", (status, key) => {
    expect(errorMessageKey(new ApiError(status, "x"))).toBe(key);
    expect(errorMessageKey(new ApiError(status, "x"), "operacionDesconocida")).toBe(key);
  });

  it("sin respuesta (red caída) → clave de conexión, aunque la operación tenga default", () => {
    expect(errorMessageKey({ request: {}, message: "Network Error" })).toBe(
      "errors:generic.network",
    );
    expect(errorMessageKey(new ApiError(null, "x"), "accountDelete")).toBe(
      "errors:generic.network",
    );
    expect(errorMessageKey(normalizeError({ code: "ERR_NETWORK", request: {} }))).toBe(
      "errors:generic.network",
    );
  });

  it("nunca devuelve el texto del servidor", () => {
    for (const status of [400, 401, 403, 404, 409, 422, 429, 500]) {
      for (const err of [axiosError(status), normalizeError(axiosError(status))]) {
        const key = errorMessageKey(err, "accountDelete");
        expect(key).toMatch(/^errors:[\w.]+$/);
        expect(key).not.toContain(SERVER_TEXT);
      }
    }
  });
});

describe("errorMessage", () => {
  it("traduce la clave e interpola los minutos de un 429", () => {
    const t = (key, values) => `${key}|${values.minutes}`;
    expect(errorMessage(t, new ApiError(429, "x", 120))).toBe("errors:generic.rateLimited|2");
    expect(errorMessageValues(new ApiError(429, "x"))).toEqual({ minutes: 15 });
  });
});

describe("normalizeError", () => {
  it("no copia el texto del servidor al ApiError", () => {
    const e = normalizeError(axiosError(409));
    expect(e.status).toBe(409);
    expect(e.message).not.toContain(SERVER_TEXT);
  });
});
