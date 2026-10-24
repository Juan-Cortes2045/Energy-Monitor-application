import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios, { AxiosError } from "axios";
import { httpClient } from "./httpClient";
import { clearSession, getSession, saveSession } from "../auth/session";

const reply = (config, status, data = {}) => {
  const response = { data, status, statusText: "", headers: {}, config };
  if (status < 400) return response;
  throw new AxiosError("fail", String(status), config, null, response);
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

describe("renovación de token", () => {
  const origHttp = httpClient.defaults.adapter;
  const origAxios = axios.defaults.adapter;
  let refreshCalls;
  let assign;

  beforeEach(() => {
    localStorage.clear();
    saveSession({ account: { idUser: "u1" }, idUserSession: "SES0000001" });
    refreshCalls = 0;
    assign = vi.fn();
    vi.stubGlobal("location", { pathname: "/dashboard", assign });
  });

  afterEach(() => {
    httpClient.defaults.adapter = origHttp;
    axios.defaults.adapter = origAxios;
    vi.unstubAllGlobals();
  });

  // El navegador guarda las cookies: aquí basta con saber si la de acceso sigue valiendo.
  let accessCookieValid;
  const api = async (config) =>
    accessCookieValid ? reply(config, 200, { ok: true }) : reply(config, 401);
  const refreshEndpoint = async (config) => {
    refreshCalls += 1;
    await delay(10);
    // Sin cuerpo: el refresh token va en su cookie, que solo se lee con la cabecera de transporte.
    expect(config.data == null).toBe(true);
    expect(config.headers["X-Session-Transport"]).toBe("cookie");
    expect(config.withCredentials).toBe(true);
    accessCookieValid = true;
    return reply(config, 200, {});
  };

  it("N peticiones con 401 simultáneo hacen UNA sola renovación y todas se reintentan", async () => {
    accessCookieValid = false;
    httpClient.defaults.adapter = api;
    axios.defaults.adapter = refreshEndpoint;

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) => httpClient.get(`/x${i}`)),
    );

    expect(refreshCalls).toBe(1);
    expect(results.every((r) => r.data.ok)).toBe(true);
    expect(getSession()).toMatchObject({ account: { idUser: "u1" } });
  });

  it("una petición que falló antes de una renovación ya hecha solo se reintenta", async () => {
    axios.defaults.adapter = refreshEndpoint;
    httpClient.defaults.adapter = (() => {
      let first = true;
      return async (config) => {
        if (first) {
          // Otra pestaña renueva mientras esta petición está en vuelo.
          first = false;
          localStorage.setItem("sessionRefreshedAt", String(Date.now() + 1));
          return reply(config, 401);
        }
        return reply(config, 200, { ok: true });
      };
    })();

    const result = await httpClient.get("/x");

    expect(result.data.ok).toBe(true);
    expect(refreshCalls).toBe(0);
  });

  it("el cierre de sesión puede renovar aunque la sesión local ya se haya borrado", async () => {
    accessCookieValid = false;
    httpClient.defaults.adapter = api;
    axios.defaults.adapter = refreshEndpoint;
    clearSession();

    const result = await httpClient.post("/auth/logout", {}, { _sessionEnding: true });

    expect(result.data.ok).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(getSession()).toBeNull();
    expect(assign).not.toHaveBeenCalled();
  });

  it("si la renovación falla limpia la sesión y redirige una sola vez", async () => {
    httpClient.defaults.adapter = async (config) => reply(config, 401);
    axios.defaults.adapter = async (config) => {
      await delay(10);
      return reply(config, 401);
    };

    const results = await Promise.allSettled([
      httpClient.get("/a"),
      httpClient.get("/b"),
      httpClient.get("/c"),
    ]);

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(getSession()).toBeNull();
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith("/login");
  });

  it("no renueva ante el 401 de login", async () => {
    httpClient.defaults.adapter = async (config) => reply(config, 401);
    axios.defaults.adapter = async (config) => {
      refreshCalls += 1;
      return reply(config, 200, {});
    };
    await expect(httpClient.post("/auth/login", {})).rejects.toMatchObject({ status: 401 });
    expect(refreshCalls).toBe(0);
  });
});
