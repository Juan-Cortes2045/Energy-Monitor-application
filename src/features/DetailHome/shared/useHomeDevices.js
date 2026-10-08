import { useCallback, useEffect, useState } from "react";
import { deviceApi, signalPercent } from "../../../services/devices";
import { ROOM_KEYS, uiApplianceType } from "./deviceTypes";

/** Estado de los dispositivos: liviano, casi en tiempo real. */
const DEVICES_REFRESH_MS = 5000;
/** Potencia, energía y curva de 24 h: más pesado, el módulo publica cada 60 s. */
const SUMMARY_REFRESH_MS = 30000;

/**
 * El módulo publica cada 60 s. Si pasa este tiempo sin noticias se saltó un envío: se muestra
 * "comprobando" hasta que el backend lo confirme desconectado (último deseo del broker a los
 * ~22 s del corte, o 150 s sin datos).
 */
const CHECKING_AFTER_MS = 75000;
const OFFLINE_AFTER_MS = 150000;

/** "online" | "checking" | "offline" */
function connectivity(device, now) {
  if (device.status !== "ONLINE" || device.lastSeen == null) return "offline";
  const age = now - new Date(device.lastSeen).getTime();
  if (age >= OFFLINE_AFTER_MS) return "offline";
  if (age >= CHECKING_AFTER_MS) return "checking";
  return "online";
}

/**
 * Dispositivos del hogar y su consumo, desde el backend.
 *
 * Cada dispositivo queda con la forma que pintan las pestañas:
 * { id, name, applianceType, roomKey | room, status: "online"|"checking"|"offline",
 *   signal (0-100), consumption (kW actuales, null si no reporta), todayEnergy (kWh) }.
 */
export function useHomeDevices(homeId) {
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Hora de la última consulta: con ella se calcula "comprobando" sin leer el reloj al pintar.
  const [now, setNow] = useState(() => Date.now());

  const loadDevices = useCallback(async () => {
    const devices = await deviceApi.listHomeDevices(homeId);
    setList(devices);
    setNow(Date.now());
    return devices;
  }, [homeId]);

  const loadSummary = useCallback(async () => {
    const consumption = await deviceApi.getConsumptionSummary(homeId);
    setSummary(consumption);
    return consumption;
  }, [homeId]);

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!quiet) setLoading(true);
      try {
        await Promise.all([loadDevices(), loadSummary()]);
        setError(null);
      } catch (err) {
        if (!quiet) setError(err);
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [loadDevices, loadSummary],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos estándar
    load();
    const devicesTimer = setInterval(() => loadDevices().catch(() => {}), DEVICES_REFRESH_MS);
    const summaryTimer = setInterval(() => loadSummary().catch(() => {}), SUMMARY_REFRESH_MS);
    return () => {
      clearInterval(devicesTimer);
      clearInterval(summaryTimer);
    };
  }, [load, loadDevices, loadSummary]);

  const byDevice = new Map((summary?.devices ?? []).map((d) => [d.deviceId, d]));
  const devices = list.map((d) => {
    const usage = byDevice.get(d.idDevice);
    const status = connectivity(d, now);
    const roomIsKey = ROOM_KEYS.includes(d.location);
    return {
      id: d.idDevice,
      code: d.deviceCode,
      name: d.name,
      applianceType: uiApplianceType(d.applianceType),
      roomKey: roomIsKey ? d.location : null,
      room: roomIsKey ? null : d.location,
      status,
      signal: status === "offline" ? 0 : signalPercent(d.signalStrength),
      lastSeen: d.lastSeen,
      consumption:
        status !== "offline" && usage?.currentPower != null
          ? Number((usage.currentPower / 1000).toFixed(3))
          : null,
      todayEnergy: usage?.todayEnergy ?? 0,
    };
  });

  const removeDevice = useCallback(
    async (deviceId) => {
      await deviceApi.unlinkDevice(homeId, deviceId);
      setList((prev) => prev.filter((d) => d.idDevice !== deviceId));
      load({ quiet: true });
    },
    [homeId, load],
  );

  return { devices, summary, loading, error, reload: load, removeDevice };
}
