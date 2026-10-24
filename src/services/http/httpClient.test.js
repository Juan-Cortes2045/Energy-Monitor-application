import { describe, it, expect, afterEach } from "vitest";
import { httpClient } from "./httpClient";
import { ApiError, normalizeError } from "./errors";
import { clearSession, saveSession } from "../auth/session";

describe("httpClient interceptor de request", () => {
  afterEach(() => {
    clearSession();
    localStorage.clear();
  });

  const capture = () => {
    const seen = {};
    httpClient.defaults.adapter = async (config) => {
      seen.config = config;
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };
    return seen;
  };

  it("no adjunta ningún token: la sesión viaja en cookies HttpOnly con sus cabeceras", async () => {
    localStorage.setItem("userId", "user-123");
    saveSession({ account: { idUser: "user-123" }, idUserSession: "SES0000001" });
    for (const method of ["get", "post", "put", "delete"]) {
      const seen = capture();
      await httpClient.request({ url: "/homes/h1/members", method, data: {} });
      const headers = seen.config.headers;
      expect(headers.Authorization).toBeUndefined();
      expect(headers["X-Requested-With"]).toBe("XMLHttpRequest");
      expect(headers["X-Session-Transport"]).toBe("cookie");
      expect(seen.config.withCredentials).toBe(true);
      const names = Object.keys(headers.toJSON?.() ?? headers).map((h) => h.toLowerCase());
      expect(names).not.toContain("x-user-id");
    }
  });

  it("no guarda tokens en la sesión aunque una respuesta los traiga", () => {
    saveSession({ accessToken: "tok", refreshToken: "r", account: { idUser: "u1" } });
    const stored = JSON.parse(localStorage.getItem("session"));
    expect(stored).not.toHaveProperty("accessToken");
    expect(stored).not.toHaveProperty("refreshToken");
    expect(stored.account.idUser).toBe("u1");
  });

  it("no envía cookies ni cabeceras de sesión a una URL absoluta de otro origen", async () => {
    saveSession({ account: { idUser: "u1" } });
    for (const url of ["https://otro.example.com/x", "//otro.example.com/x"]) {
      const seen = capture();
      await httpClient.get(url);
      expect(seen.config.withCredentials).toBe(false);
      expect(seen.config.headers["X-Requested-With"]).toBeUndefined();
      expect(seen.config.headers["X-Session-Transport"]).toBeUndefined();
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
