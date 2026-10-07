import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AxiosError } from "axios";
import { httpClient } from "../http/httpClient";
import { logout } from "./authApi";
import { getSession, saveSession } from "./session";

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
