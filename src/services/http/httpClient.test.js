import { describe, it, expect, beforeEach } from "vitest";
import { httpClient } from "./httpClient";
import { setCurrentUserIdProvider } from "./currentUser";
import { ApiError, normalizeError } from "./errors";
import { clearSession, saveSession } from "../auth/session";

const capture = async () => {
  let seen;
  httpClient.defaults.adapter = async (config) => {
    seen = config;
    return { data: {}, status: 200, statusText: "OK", headers: {}, config };
  };
  await httpClient.get("/probe");
  return seen;
};

describe("httpClient interceptor X-User-Id", () => {
  beforeEach(() => {
    setCurrentUserIdProvider(() => "user-123");
  });

  it("añade X-User-Id desde el proveedor único", async () => {
    const config = await capture();
    expect(config.headers["X-User-Id"]).toBe("user-123");
  });

  it("no añade el header si no hay identidad", async () => {
    setCurrentUserIdProvider(() => null);
    const config = await capture();
    expect(config.headers["X-User-Id"]).toBeUndefined();
  });

  it("no envía credenciales a los endpoints públicos de autenticación", async () => {
    saveSession({ accessToken: "token-vencido", refreshToken: "r" });
    try {
      for (const url of ["/auth/register", "/auth/login", "/auth/email/verify"]) {
        let seen;
        httpClient.defaults.adapter = async (config) => {
          seen = config;
          return { data: {}, status: 200, statusText: "OK", headers: {}, config };
        };
        await httpClient.post(url, {});
        expect(seen.headers.Authorization).toBeUndefined();
        expect(seen.headers["X-User-Id"]).toBeUndefined();
      }
    } finally {
      clearSession();
    }
  });
});

describe("mapeo de errores a ApiError", () => {
  const cases = [
    [400, "field: msg"],
    [401, "missing header"],
    [403, "forbidden"],
    [404, "not found"],
    [409, "conflict"],
    [500, "unexpected"],
  ];

  it.each(cases)("status %i usa el mensaje del backend", async (status, message) => {
    httpClient.defaults.adapter = async () => {
      const err = new Error("Request failed");
      err.response = { status, data: { error: message } };
      throw err;
    };
    await expect(httpClient.get("/x")).rejects.toMatchObject({
      name: "ApiError",
      status,
      message,
    });
  });

  it("red sin respuesta produce mensaje de conexión", async () => {
    httpClient.defaults.adapter = async () => {
      const err = new Error("Network Error");
      err.code = "ERR_NETWORK";
      throw err;
    };
    await expect(httpClient.get("/x")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("normalizeError", () => {
  it("deja pasar ApiError tal cual", () => {
    const e = new ApiError(400, "x");
    expect(normalizeError(e)).toBe(e);
  });

  it("500 sin cuerpo usa mensaje genérico", () => {
    const e = normalizeError({ response: { status: 500, data: null } });
    expect(e.status).toBe(500);
    expect(e.message).toBeTruthy();
  });
});
