// Auto-resolución de alertas: reglas puras (sin I/O) que deciden si una
// alerta PENDING ya dejó de tener sentido, para que mock/live-measurements.js
// y mock/server.js puedan aplicarlas sin duplicar lógica. Quien llama a
// resolveAlerts() es responsable de persistir el `db` mutado — este módulo
// nunca toca disco.

import { buildMeasurementIndex, kwhDelta, latestReading, classifyConsumptionLevel } from "./consumption.js";
import { touch, nowIso } from "./http.js";

const DAY_MS = 86_400_000;

// THRESHOLD: se resuelve cuando el consumo de las últimas 24h del
// dispositivo cae a un nivel estrictamente inferior al que disparó la
// alerta. `latestReading(sorted, fromMs)` se usa como sonda de "hay
// suficiente historial" — si no hay ninguna medición en o antes de
// `ahora - 24h`, el dispositivo es demasiado nuevo y la alerta se deja tal
// cual (ni se resuelve ni es un error).
//
// CONNECTIVITY: se resuelve en cuanto existe cualquier medición posterior a
// `alert.date_time` para ese dispositivo — señal de que volvió a mandar
// telemetría. Al resolverse, también se marca ONLINE el
// device-status-logs más reciente de ese dispositivo.
export function resolveAlerts(db, { now = new Date() } = {}) {
  for (const key of ["alerts", "measurements", "device-status-logs", "consumption-levels"]) {
    if (!Array.isArray(db[key])) throw new Error(`Collection "${key}" is missing or not an array in db`);
  }

  const nowMs = now.getTime();
  const measurementIndex = buildMeasurementIndex(db.measurements);
  const consumptionLevels = db["consumption-levels"];
  const statusLogs = db["device-status-logs"];

  let thresholdResolved = 0;
  let connectivityResolved = 0;

  for (const alert of db.alerts) {
    if (alert.alert_status !== "PENDING") continue;

    if (alert.type === "THRESHOLD") {
      const sorted = measurementIndex.get(alert.device_id);
      if (!sorted || sorted.length === 0) continue;

      const latest = latestReading(sorted, nowMs);
      if (!latest) continue;

      const anchorMs = new Date(latest.date_time).getTime();
      const fromMs = anchorMs - DAY_MS;

      // Gate de "no hay suficiente historial": sin una medición ancla en o
      // antes de hace 24h, el dispositivo es demasiado reciente para juzgar
      // su consumo diario — dejar la alerta como está.
      const startReading = latestReading(sorted, fromMs);
      if (!startReading) continue;

      const kwh = kwhDelta(sorted, fromMs, anchorMs);
      const newLevel = classifyConsumptionLevel(consumptionLevels, kwh);
      const originalLevel = consumptionLevels.find((l) => l.id === alert.consumption_level_id);
      if (!originalLevel) continue;

      if (newLevel.min_limit < originalLevel.min_limit) {
        alert.alert_status = "RESOLVED";
        touch(alert);
        thresholdResolved += 1;
      }
    } else if (alert.type === "CONNECTIVITY") {
      const alertMs = new Date(alert.date_time).getTime();
      const sorted = measurementIndex.get(alert.device_id) || [];
      const hasNewerReading = sorted.some((m) => new Date(m.date_time).getTime() > alertMs);
      if (!hasNewerReading) continue;

      alert.alert_status = "RESOLVED";
      touch(alert);
      connectivityResolved += 1;

      const latestLog = statusLogs
        .filter((s) => s.device_id === alert.device_id)
        .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))[0];
      if (latestLog) {
        latestLog.status = "ONLINE";
        latestLog.last_seen = nowIso();
        touch(latestLog);
      }
    }
  }

  return { threshold: thresholdResolved, connectivity: connectivityResolved };
}
