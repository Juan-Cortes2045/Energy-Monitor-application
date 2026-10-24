import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AxiosError } from "axios";
import { httpClient } from "../http/httpClient";
import { unsubscribeThisBrowser } from "../notifications/webPush";
import { logout, refreshProfile } from "./authApi";
import { getCurrentPerson, getPermissions, getSession, saveSession } from "./session";

vi.mock("../notifications/webPush", () => ({ unsubscribeThisBrowser: vi.fn() }));

const jwt = (sub) => `h.${btoa(JSON.stringify({ sub }))}.s`;

describe("logout", () => {
  const orig = httpClient.defaults.adapter;
  afterEach(() => {
    httpClient.defaults.adapter = orig;
    vi.mocked(unsubscribeThisBrowser).mockReset();
  });
  beforeEach(() => {
    localStorage.clear();
    saveSession({ account: { idUser: "u" }, idUserSession: "SES1" });
    localStorage.setItem("userId", "u"); // clave antigua de X-User-Id: el logout la limpia
  });

  it("limpia la sesión aunque el backend falle", async () => {
    let seen;
    httpClient.defaults.adapter = async (config) => {
      seen = config;
      throw new AxiosError("boom", "ERR_NETWORK", config);
    };
    await expect(logout()).resolves.toBeUndefined();
    expect(getSession()).toBeNull();
    expect(localStorage.getItem("userId")).toBeNull();
    expect(seen.url).toBe("/auth/logout");
    expect(JSON.parse(seen.data)).toEqual({ idUserSession: "SES1" });
    // La sesión va en cookies: ningún token en la petición.
    expect(seen.headers.Authorization).toBeUndefined();
  });

  it("da de baja el push de este navegador antes de cerrar la sesión en el backend", async () => {
    const calls = [];
    vi.mocked(unsubscribeThisBrowser).mockImplementation(async (config) => {
      calls.push(["push", config]);
    });
    httpClient.defaults.adapter = async (config) => {
      calls.push(["logout", config.url]);
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };

    await logout();

    expect(calls.map(([what]) => what)).toEqual(["push", "logout"]);
    expect(calls[0][1]).toEqual({ _sessionEnding: true });
  });

  it("sin sesión no llama al backend", async () => {
    localStorage.clear();
    const adapter = vi.fn();
    httpClient.defaults.adapter = adapter;
    await logout();
    expect(adapter).not.toHaveBeenCalled();
    expect(unsubscribeThisBrowser).not.toHaveBeenCalled();
  });
});

describe("saveSession", () => {
  it("ya no guarda la clave suelta userId", () => {
    localStorage.clear();
    saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u" } });
    expect(localStorage.getItem("userId")).toBeNull();
    expect(getCurrentPerson().id).toBe("u");
  });
});

describe("refreshProfile", () => {
  const orig = httpClient.defaults.adapter;
  afterEach(() => {
    httpClient.defaults.adapter = orig;
  });
  beforeEach(() => {
    localStorage.clear();
    saveSession({ accessToken: jwt("S"), refreshToken: "r", account: { idUser: "u", email: "a@b.co" } });
  });

  const reply = (config, data) => ({ data, status: 200, statusText: "OK", headers: {}, config });

  it("usa nombre y apellido de GET /auth/account cuando el backend los trae", async () => {
    const calls = [];
    httpClient.defaults.adapter = async (config) => {
      calls.push(`${config.method} ${config.url}`);
      if (config.url === "/auth/permissions") return reply(config, { permissions: [] });
      return reply(config, { email: "a@b.co", name: "Ada", lastName: "Lovelace", profileImage: "data:x" });
    };
    await refreshProfile();
    expect(calls).toContain("get /auth/account");
    expect(getCurrentPerson()).toMatchObject({ name: "Ada", lastName: "Lovelace", profileImage: "data:x" });
  });

  it("guarda en la sesión los permisos de GET /auth/permissions", async () => {
    expect(getPermissions()).toBeNull();
    httpClient.defaults.adapter = async (config) =>
      config.url === "/auth/permissions"
        ? reply(config, { permissions: ["USER.READ"] })
        : reply(config, { email: "a@b.co" });
    await refreshProfile();
    expect(getPermissions()).toEqual(["USER.READ"]);
  });
});
