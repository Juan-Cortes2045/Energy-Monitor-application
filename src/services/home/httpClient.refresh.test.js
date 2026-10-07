import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios, { AxiosError } from "axios";
import { httpClient } from "./httpClient";
import { getSession, saveSession } from "../../features/auth/services/session";

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
    saveSession({ accessToken: "old", refreshToken: "r1", account: { idUser: "u1" } });
    refreshCalls = 0;
    assign = vi.fn();
    vi.stubGlobal("location", { pathname: "/dashboard", assign });
  });

  afterEach(() => {
    httpClient.defaults.adapter = origHttp;
    axios.defaults.adapter = origAxios;
    vi.unstubAllGlobals();
  });

  it("N peticiones con 401 simultáneo hacen UNA sola renovación y todas se reintentan", async () => {
    httpClient.defaults.adapter = async (config) =>
      config.headers.Authorization === "Bearer new"
        ? reply(config, 200, { ok: true })
        : reply(config, 401);
    axios.defaults.adapter = async (config) => {
      refreshCalls += 1;
      await delay(10);
      expect(JSON.parse(config.data).refreshToken).toBe("r1");
      return reply(config, 200, { accessToken: "new", refreshToken: "r2" });
    };

    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) => httpClient.get(`/x${i}`)),
    );

    expect(refreshCalls).toBe(1);
    expect(results.every((r) => r.data.ok)).toBe(true);
    expect(getSession()).toMatchObject({ accessToken: "new", refreshToken: "r2" });
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
