import { describe, it, expect, afterEach } from "vitest";
import { httpClient } from "./httpClient";
import { ApiError, normalizeError } from "./errors";
import { clearSession, saveSession } from "../auth/session";

describe("httpClient interceptor de request", () => {
  afterEach(() => {
    clearSession();
    localStorage.clear();
  });

  it("ninguna petición envía X-User-Id, aunque haya sesión y la clave antigua userId", async () => {
    localStorage.setItem("userId", "user-123");
    saveSession({ accessToken: "tok", refreshToken: "r", account: { idUser: "user-123" } });
    const methods = ["get", "post", "put", "delete"];
    for (const method of methods) {
      let seen;
      httpClient.defaults.adapter = async (config) => {
        seen = config;
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      };
      await httpClient.request({ url: "/homes/h1/members", method, data: {} });
      expect(seen.headers.Authorization).toBe("Bearer tok");
      const names = Object.keys(seen.headers.toJSON?.() ?? seen.headers).map((h) => h.toLowerCase());
      expect(names).not.toContain("x-user-id");
    }
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

  it.each(cases)("status %i conserva el status y descarta el texto del backend", async (status, message) => {
    httpClient.defaults.adapter = async () => {
      const err = new Error("Request failed");
      err.response = { status, data: { error: message, message } };
      throw err;
    };
    const e = await httpClient.get("/x").catch((err) => err);
    expect(e).toMatchObject({ name: "ApiError", status });
    expect(e.message).not.toContain(message);
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
