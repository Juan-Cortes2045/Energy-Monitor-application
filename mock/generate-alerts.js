#!/usr/bin/env node
/**
 * Arma dos alertas PENDING de prueba en "Main House" para poder ejercitar el
 * flujo de resolución automática (mock/lib/alert-resolver.js) sin esperar a
 * que el sistema las genere orgánicamente:
 *   - Una THRESHOLD apuntando a HIGH, sobre el dispositivo con mayor consumo
 *     real de las últimas 24h (el que más chance tiene de quedarse PENDING
 *     un rato, en vez de resolverse en el instante).
 *   - Una CONNECTIVITY sobre un segundo dispositivo distinto, con
 *     `date_time` fijado justo después de su última medición real (nunca
 *     "hace 2 horas" a secas: como mock/seed.js ancla "ahora" al reloj real,
 *     todo dispositivo vinculado ya tiene mediciones recientes, así que un
 *     `date_time` de hace 2h literal quedaría por detrás de datos que ya
 *     existen y la alerta se resolvería sola al instante en vez de esperar
 *     al próximo ciclo de mock/live-measurements.js).
 *
 * Idempotente: usa ids sintéticos fijos (fuera del rango de 7 dígitos que
 * administra createResumingIdFactory) y, si ya existen, las REINICIA a
 * PENDING con una fecha fresca en vez de crear filas duplicadas — así se
 * puede correr el script tantas veces como haga falta para volver a probar
 * el flujo completo desde cero.
 *
 * Usage:
 *   node mock/generate-alerts.js
 *   npm run mock:alerts
 *
 * Escribe directamente en mock/db.json, igual que mock/add-spare-devices.js
 * y mock/fill-measurements.js — pero, a diferencia de add-spare-devices.js,
 * no hace falta reiniciar mock/server.js si ya está corriendo: su
 * refreshCollectionsFromDisk() recoge alertas nuevas/reiniciadas en la
 * siguiente petición a GET /api/alerts (ver mock/README.md).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { nowIso } from "./lib/http.js";
import { buildMeasurementIndex, kwhDelta, latestReading } from "./lib/consumption.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");
const DAY_MS = 86_400_000;

const THRESHOLD_TEST_ALERT_ID = "ALT-TEST-THRESHOLD";
const CONNECTIVITY_TEST_ALERT_ID = "ALT-TEST-CONNECTIVITY";
const CONNECTIVITY_ALERT_AGE_MS = 2 * 3_600_000;

if (!existsSync(DB_PATH)) {
  console.error(`db.json not found at ${DB_PATH}. Run "npm run mock:seed" first.`);
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

for (const key of ["homes", "devices", "device-homes", "consumption-levels", "measurements", "alerts"]) {
  if (!Array.isArray(db[key])) {
    console.error(`Collection "${key}" is missing from ${DB_PATH}.`);
    process.exit(1);
  }
}

const home = db.homes.find((h) => h.name === "Main House" && !h.deleted_at);
if (!home) {
  console.error('No home named "Main House" found in db.json.');
  process.exit(1);
}

const linkedDeviceIds = db["device-homes"]
  .filter((l) => l.home_id === home.id && !l.deleted_at)
  .map((l) => l.device_id);
const linkedDevices = linkedDeviceIds
  .map((id) => db.devices.find((d) => d.id === id && !d.deleted_at))
  .filter(Boolean);

if (linkedDevices.length < 2) {
  console.error(`"Main House" needs at least 2 linked devices to generate both test alerts (found ${linkedDevices.length}).`);
  process.exit(1);
}

const nowMs = Date.now();
const measurementIndex = buildMeasurementIndex(db.measurements);

// Ordenar por consumo real de las últimas 24h, descendente: el primero es el
// mejor candidato para la alerta THRESHOLD (más chance de quedarse PENDING
// en vez de resolverse al instante); el resto queda disponible para elegir
// un segundo dispositivo distinto para la alerta CONNECTIVITY.
const byRecentConsumptionDesc = [...linkedDevices].sort((a, b) => {
  const kwhA = kwhDelta(measurementIndex.get(a.id), nowMs - DAY_MS, nowMs);
  const kwhB = kwhDelta(measurementIndex.get(b.id), nowMs - DAY_MS, nowMs);
  return kwhB - kwhA;
});

const thresholdDevice = byRecentConsumptionDesc[0];
const connectivityDevice = byRecentConsumptionDesc.find((d) => d.id !== thresholdDevice.id);

const highLevel =
  db["consumption-levels"].find((l) => l.name === "HIGH" && !l.deleted_at) ??
  db["consumption-levels"].find((l) => l.name === "CRITICAL" && !l.deleted_at);
if (!highLevel) {
  console.error('No "HIGH" (or "CRITICAL") consumption level found in db.json.');
  process.exit(1);
}

function latestMeasurementId(deviceId) {
  const rows = db.measurements.filter((m) => m.device_id === deviceId);
  if (rows.length === 0) return null;
  return rows.reduce((latest, m) => (new Date(m.date_time) > new Date(latest.date_time) ? m : latest)).id;
}

function upsertAlert(fixedId, buildRow) {
  const existing = db.alerts.find((a) => a.id === fixedId);
  if (existing) {
    Object.assign(existing, buildRow(existing.created_at));
    existing.updated_at = nowIso();
    return "reset";
  }
  const timestamp = nowIso();
  db.alerts.push({ id: fixedId, id_alert: fixedId, ...buildRow(timestamp), created_at: timestamp, updated_at: timestamp, deleted_at: null });
  return "created";
}

const thresholdOutcome = upsertAlert(THRESHOLD_TEST_ALERT_ID, () => ({
  home_id: home.id,
  device_id: thresholdDevice.id,
  type: "THRESHOLD",
  message_key: "threshold.dailyExceeded",
  date_time: nowIso(),
  alert_status: "PENDING",
  consumption_level_id: highLevel.id,
  measurement_id: latestMeasurementId(thresholdDevice.id),
}));

// La alerta debe quedar PENDING hasta que llegue una medición realmente
// posterior a su date_time — así que date_time nunca puede ser anterior a la
// última medición que el dispositivo ya tiene. Se usa la más tardía entre
// "hace 2 horas" (lo pedido) y "justo después de la última medición real"
// (para que el dataset actual, con datos frescos hasta ahora mismo gracias a
// mock/seed.js, no la resuelva instantáneamente).
const connectivityLatest = latestReading(measurementIndex.get(connectivityDevice.id), nowMs);
const connectivityAlertMs = Math.max(
  nowMs - CONNECTIVITY_ALERT_AGE_MS,
  connectivityLatest ? new Date(connectivityLatest.date_time).getTime() + 1000 : nowMs - CONNECTIVITY_ALERT_AGE_MS,
);

const connectivityOutcome = upsertAlert(CONNECTIVITY_TEST_ALERT_ID, () => ({
  home_id: home.id,
  device_id: connectivityDevice.id,
  type: "CONNECTIVITY",
  message_key: "connectivity.deviceOffline",
  date_time: new Date(connectivityAlertMs).toISOString(),
  alert_status: "PENDING",
  consumption_level_id: null,
  measurement_id: latestMeasurementId(connectivityDevice.id),
}));

writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log(`${THRESHOLD_TEST_ALERT_ID} (${thresholdOutcome}): THRESHOLD/PENDING, level=${highLevel.name}, device=${thresholdDevice.name}`);
console.log(`${CONNECTIVITY_TEST_ALERT_ID} (${connectivityOutcome}): CONNECTIVITY/PENDING, device=${connectivityDevice.name}, date_time=${new Date(connectivityAlertMs).toISOString()}`);
console.log("\nSi mock/server.js ya está corriendo, no hace falta reiniciarlo: GET /api/alerts recoge este cambio en la siguiente petición.");
