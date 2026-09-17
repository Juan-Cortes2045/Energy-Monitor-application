#!/usr/bin/env node
/**
 * Continuous mock telemetry generator: simulates every linked device's ESP32
 * posting a new reading on a fixed interval, so a long-running dev session
 * never re-opens the "no measurements for today" gap that motivated
 * mock/fill-measurements.js in the first place.
 *
 * On startup, closes any existing gap (same logic as
 * mock/fill-measurements.js), then every MEASUREMENT_INTERVAL_MS (default
 * 900000 = 15 min) appends one new measurement per linked, active device
 * with date_time = new Date(), voltage/current/power drawn from the same
 * appliance profile as mock/seed.js, and stored_energy continuing from the
 * previous reading. After each tick's measurements are generated, it also
 * runs mock/lib/alert-resolver.js's resolveAlerts() over the same in-memory
 * db, so a CONNECTIVITY alert clears itself the moment its device starts
 * reporting again and a THRESHOLD alert clears itself once the device's
 * trailing-24h consumption drops back below the level that triggered it.
 *
 * Usage:
 *   node mock/live-measurements.js
 *   npm run mock:live
 *   MEASUREMENT_INTERVAL_MS=10000 npm run mock:live   # 1 reading/10s, manual testing
 *
 * Meant to run alongside mock/server.js (see "dev:full" in package.json).
 * IMPORTANT: this script writes directly to mock/db.json on its own
 * schedule, independent of the running server's in-memory copy — same
 * caveat as mock/add-spare-devices.js. mock/server.js re-reads the
 * measurements collection from disk on every request specifically so it
 * picks up what this script appends without needing a restart (see
 * refreshMeasurementsFromDisk() there). Collisions with a server-side write
 * to some OTHER collection (e.g. a login happening in the same instant) are
 * not fully guarded against — acceptable for a local mock/dev tool, not
 * meant to model a real concurrent-writer database.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPrng } from "./lib/prng.js";
import { createResumingIdFactory } from "./lib/ids.js";
import { fillMeasurementGaps } from "./fill-measurements.js";
import { nextMeasurementRow, STEP_MS } from "./lib/measurement-gen.js";
import { resolveAlerts } from "./lib/alert-resolver.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");
const INTERVAL_MS = Number(process.env.MEASUREMENT_INTERVAL_MS) || STEP_MS;
const HOUR_MS = 3_600_000;

if (!existsSync(DB_PATH)) {
  console.error(`mock/db.json not found. Run "npm run mock:seed" first, then "npm run mock:live".`);
  process.exit(1);
}

function loadDb() {
  return JSON.parse(readFileSync(DB_PATH, "utf8"));
}

function saveDb(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function activeDeviceRows(db) {
  const activeDeviceIds = new Set(
    db["device-homes"].filter((r) => !r.deleted_at).map((r) => r.device_id),
  );
  return db.devices.filter((d) => !d.deleted_at && activeDeviceIds.has(d.id));
}

// --- startup: close any existing gap first --------------------------------

{
  const db = loadDb();
  const summary = fillMeasurementGaps(db);
  saveDb(db);
  const totalAdded = summary.reduce((n, s) => n + s.added, 0);
  console.log(`[live] startup gap-fill: +${totalAdded} measurement(s) across ${summary.length} linked device(s)`);
}

// --- recurring tick: one new reading per active device --------------------

// Seeded per-process-start so a given run's readings are reproducible, but
// distinct from mock:seed/mock:fill/mock:add-spares (never Math.random() in
// the mock data pipeline).
const rand = createPrng((Date.now() & 0xffffffff) >>> 0);

function tick() {
  const db = loadDb();
  const applianceNameById = new Map(db["appliance-types"].map((t) => [t.id, t.name]));

  const latestByDevice = new Map();
  for (const m of db.measurements) {
    const current = latestByDevice.get(m.device_id);
    if (!current || new Date(m.date_time).getTime() > new Date(current.date_time).getTime()) {
      latestByDevice.set(m.device_id, m);
    }
  }

  const nextId = createResumingIdFactory("measurements", db.measurements);
  const now = new Date();
  const nowMs = now.getTime();
  const devices = activeDeviceRows(db);

  let count = 0;
  for (const device of devices) {
    const last = latestByDevice.get(device.id);
    const applianceKey = applianceNameById.get(device.appliance_type_id) ?? "other";
    const previousStoredEnergyKwh = last?.stored_energy ?? 0;
    const previousTs = last ? new Date(last.date_time).getTime() : nowMs - STEP_MS;
    const deltaHours = Math.max(0, (nowMs - previousTs) / HOUR_MS);

    const row = nextMeasurementRow({
      rand,
      id: nextId(),
      deviceId: device.id,
      applianceKey,
      date: now,
      previousStoredEnergyKwh,
      deltaHours,
    });
    db.measurements.push(row);
    count += 1;
  }

  const resolved = resolveAlerts(db, { now });

  saveDb(db);
  console.log(`[live] +${count} mediciones @ ${now.toISOString()}`);
  if (resolved.threshold + resolved.connectivity > 0) {
    console.log(
      `[live] auto-resolved ${resolved.threshold + resolved.connectivity} alert(s): ${resolved.threshold} threshold, ${resolved.connectivity} connectivity`,
    );
  }
}

console.log(
  `[live] generating one measurement per linked device every ${INTERVAL_MS}ms (MEASUREMENT_INTERVAL_MS)`,
);
const timer = setInterval(tick, INTERVAL_MS);

function shutdown() {
  clearInterval(timer);
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
