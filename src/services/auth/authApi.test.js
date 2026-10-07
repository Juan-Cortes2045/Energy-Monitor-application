import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AxiosError } from "axios";
import { httpClient } from "../http/httpClient";
import { logout, refreshProfile } from "./authApi";
import { getCurrentPerson, getSession, saveSession } from "./session";

const jwt = (sub) => `h.${btoa(JSON.stringify({ sub }))}.s`;

describe("logout", () => {
  const orig = httpClient.defaults.adapter;
  afterEach(() => {
    httpClient.defaults.adapter = orig;
  });
  beforeEach(() => {
    localStorage.clear();
    saveSession({ accessToken: jwt("SES1"), refreshToken: "r", account: { idUser: "u" } });
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
    expect(JSON.parse(seen.data)).toEqual({ idUserSession: "SES1" });
    expect(seen.headers.Authorization).toBe(`Bearer ${jwt("SES1")}`);
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
      return reply(config, { email: "a@b.co", name: "Ada", lastName: "Lovelace", profileImage: "data:x" });
    };
    await refreshProfile();
    expect(calls).toEqual(["get /auth/account"]);
    expect(getCurrentPerson()).toMatchObject({ name: "Ada", lastName: "Lovelace", profileImage: "data:x" });
  });
});
