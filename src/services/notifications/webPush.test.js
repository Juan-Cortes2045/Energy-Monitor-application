import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("./notificationApi", () => ({
  getPushPublicKey: vi.fn().mockResolvedValue("AQAB"),
  savePushSubscription: vi.fn().mockResolvedValue(),
  removePushSubscription: vi.fn().mockResolvedValue(),
}));

import { isBraveBrowser, subscribeThisBrowser } from "./webPush";

const failure = (name) => Object.assign(new Error("Registration failed - push service error"), { name });

function installPushApi({ subscribe, brave }) {
  const reg = { pushManager: { getSubscription: vi.fn().mockResolvedValue(null), subscribe } };
  Object.defineProperty(window, "PushManager", { value: class {}, configurable: true });
  Object.defineProperty(window, "Notification", {
    value: { requestPermission: vi.fn().mockResolvedValue("granted"), permission: "default" },
    configurable: true,
  });
  Object.defineProperty(navigator, "serviceWorker", {
    value: { register: vi.fn().mockResolvedValue(reg), ready: Promise.resolve(reg), getRegistration: vi.fn() },
    configurable: true,
  });
  Object.defineProperty(navigator, "brave", {
    value: brave ? { isBrave: () => Promise.resolve(true) } : undefined,
    configurable: true,
  });
}

describe("subscribeThisBrowser", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => {
    delete window.PushManager;
    delete window.Notification;
    delete navigator.serviceWorker;
    delete navigator.brave;
  });

  it("suscribe cuando el navegador lo permite", async () => {
    const subscription = { toJSON: () => ({ endpoint: "https://push/x" }) };
    installPushApi({ subscribe: vi.fn().mockResolvedValue(subscription) });
    await expect(subscribeThisBrowser()).resolves.toBe("subscribed");
  });

  it("en Brave, si el servicio push de Google está apagado, lo dice con un resultado propio", async () => {
    installPushApi({ subscribe: vi.fn().mockRejectedValue(failure("AbortError")), brave: true });
    await expect(subscribeThisBrowser()).resolves.toBe("braveBlocked");
  });

  it("en otro navegador, el mismo fallo es un servicio bloqueado", async () => {
    installPushApi({ subscribe: vi.fn().mockRejectedValue(failure("AbortError")) });
    await expect(subscribeThisBrowser()).resolves.toBe("serviceBlocked");
  });

  it("un error inesperado no se disfraza", async () => {
    installPushApi({ subscribe: vi.fn().mockRejectedValue(failure("TypeError")) });
    await expect(subscribeThisBrowser()).rejects.toThrow();
  });
});

describe("isBraveBrowser", () => {
  afterEach(() => delete navigator.brave);
  it("es falso sin navigator.brave", async () => {
    await expect(isBraveBrowser()).resolves.toBe(false);
  });
  it("es verdadero si navigator.brave.isBrave() lo confirma", async () => {
    Object.defineProperty(navigator, "brave", { value: { isBrave: () => Promise.resolve(true) }, configurable: true });
    await expect(isBraveBrowser()).resolves.toBe(true);
  });
});
