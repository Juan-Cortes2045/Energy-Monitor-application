/**
 * Vinculación de un módulo EnergyMonitor por Web Bluetooth.
 *
 * Protocolo (debe coincidir con devices/esp32-pzem-monitor/config.h):
 *   INFO      read    {"code","id","fw","cfg"}
 *   NETWORKS  read    [{"s": ssid, "r": rssi, "e": 0|1}]; write = volver a escanear
 *   CONFIG    write   JSON en trozos: "+" trozo, "=" último trozo, "!" reinicia
 *   STATUS    notify  scan_done | wifi_connecting | wifi_ok | wifi_failed[:auth|:notfound] |
 *                     mqtt_connecting | mqtt_ok | mqtt_failed:<rc> | bad_config
 *
 * Web Bluetooth existe en Chrome/Edge de escritorio y en Chrome Android, y exige
 * HTTPS o localhost. Safari (iPhone) y Firefox no lo tienen: ahí queda el portal Wi-Fi.
 */

export const SERVICE_UUID = "8f2a0001-5e8c-4a7b-9c3d-2f1e0b7a6c51";
const INFO_UUID = "8f2a0002-5e8c-4a7b-9c3d-2f1e0b7a6c51";
const NETWORKS_UUID = "8f2a0003-5e8c-4a7b-9c3d-2f1e0b7a6c51";
const CONFIG_UUID = "8f2a0004-5e8c-4a7b-9c3d-2f1e0b7a6c51";
const STATUS_UUID = "8f2a0005-5e8c-4a7b-9c3d-2f1e0b7a6c51";

const CHUNK = 150;
const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function isBluetoothSupported() {
  return typeof navigator !== "undefined" && !!navigator.bluetooth && globalThis.isSecureContext !== false;
}

/**
 * Chrome/Edge de escritorio en Linux traen Web Bluetooth apagado: se activa con
 * chrome://flags/#enable-experimental-web-platform-features.
 */
export function needsLinuxBluetoothFlag() {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  return !isBluetoothSupported() && /Linux/.test(ua) && !/Android/.test(ua) && /Chrome\//.test(ua);
}

/** Convierte dBm en un porcentaje aproximado de señal (−100 dBm = 0 %, −50 dBm = 100 %). */
export function signalPercent(dbm) {
  if (dbm == null) return 0;
  return Math.max(0, Math.min(100, 2 * (dbm + 100)));
}

/**
 * Abre el selector del navegador, se conecta al módulo elegido y lee su identidad.
 * @returns {Promise<ModuleSession>}
 */
export async function connectModule() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(SERVICE_UUID);
  const [info, networks, config, status] = await Promise.all([
    service.getCharacteristic(INFO_UUID),
    service.getCharacteristic(NETWORKS_UUID),
    service.getCharacteristic(CONFIG_UUID),
    service.getCharacteristic(STATUS_UUID),
  ]);
  const identity = JSON.parse(decoder.decode(await info.readValue()));
  return new ModuleSession(device, { networks, config, status }, identity);
}

export class ModuleSession {
  constructor(device, chars, identity) {
    this.device = device;
    this.chars = chars;
    /** @type {{code: string, id: string, fw: string, cfg: number}} */
    this.identity = identity;
    this.listeners = new Set();
    this.onStatusChanged = (event) => {
      const value = decoder.decode(event.target.value);
      this.listeners.forEach((listener) => listener(value));
    };
    this.notifying = false;
  }

  get name() {
    return this.device.name ?? `EnergyMonitor-${this.identity.code}`;
  }

  async ensureNotifications() {
    if (this.notifying) return;
    await this.chars.status.startNotifications();
    this.chars.status.addEventListener("characteristicvaluechanged", this.onStatusChanged);
    this.notifying = true;
  }

  /** @param {(status: string) => void} listener @returns {() => void} */
  onStatus(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Espera un estado que cumpla `predicate`, o falla al vencer `timeoutMs`. */
  waitFor(predicate, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error("timeout"));
      }, timeoutMs);
      const off = this.onStatus((status) => {
        if (predicate(status)) {
          clearTimeout(timer);
          off();
          resolve(status);
        }
      });
    });
  }

  /**
   * Pide al módulo que escanee y devuelve las redes que ve, de mejor a peor señal.
   * @returns {Promise<Array<{ssid: string, rssi: number, secured: boolean}>>}
   */
  async scanNetworks() {
    await this.ensureNotifications();
    // El módulo puede estar terminando un intento de conexión al servidor antes de escanear.
    const done = this.waitFor((s) => s === "scan_done", 30000).catch(() => null);
    await this.chars.networks.writeValueWithResponse(encoder.encode("1"));
    await done;
    let raw;
    try {
      raw = JSON.parse(decoder.decode(await this.chars.networks.readValue()) || "[]");
    } catch {
      raw = [];
    }
    // Un firmware anterior a 1.3.6 deja "1" (lo escrito) como valor: no es una lista.
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((n) => n && typeof n.s === "string")
      .map((n) => ({ ssid: n.s, rssi: n.r, secured: n.e === 1 }));
  }

  /**
   * Envía Wi-Fi, servidor e identidad. El progreso llega por `onStatus`.
   * @param {{ssid: string, pass: string, host: string, port: number, id: string, key: string}} config
   */
  async sendConfig(config) {
    await this.ensureNotifications();
    const json = JSON.stringify(config);
    await this.chars.config.writeValueWithResponse(encoder.encode("!"));
    for (let i = 0; i < json.length; i += CHUNK) {
      const last = i + CHUNK >= json.length;
      const frame = (last ? "=" : "+") + json.slice(i, i + CHUNK);
      await this.chars.config.writeValueWithResponse(encoder.encode(frame));
    }
  }

  disconnect() {
    try {
      if (this.notifying) {
        this.chars.status.removeEventListener("characteristicvaluechanged", this.onStatusChanged);
      }
      this.device.gatt?.disconnect();
    } catch {
      // ya desconectado
    }
  }
}
