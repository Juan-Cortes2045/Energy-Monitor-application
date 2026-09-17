#!/usr/bin/env node
/**
 * Fills the gap between each linked device's most recent measurement and the
 * current wall-clock time, in 15-minute steps, without touching any
 * measurement that already exists.
 *
 * Why this exists: mock/seed.js used to anchor "now" to a fixed date
 * (2026-09-15T12:00:00Z). Any time the real clock moved past that anchor,
 * the consumption endpoints (which filter by the real `new Date()`) found
 * no "today"/"this week" measurements and the frontend's charts went empty
 * even though db.json had plenty of (now too-old) data. seed.js anchors to
 * the real clock on every run now, so a fresh `npm run mock:seed` no longer
 * has this problem — this script exists to repair an ALREADY-generated
 * db.json (e.g. one you seeded yesterday, or checked out from someone else)
 * without re-seeding everything from scratch and losing spare devices,
 * alerts, etc.
 *
 * Only devices with an active (non-deleted) row in device-homes are filled —
 * unlinked ("spare") devices have no home to show consumption for, so their
 * measurement history is left as-is.
 *
 * Usage:
 *   node mock/fill-measurements.js
 *   npm run mock:fill
 *
 * IMPORTANT: same caveat as mock/add-spare-devices.js — mock/server.js keeps
 * the whole db in memory. Run this before starting the server, or restart it
 * afterwards. (mock/server.js also re-reads the measurements collection from
 * disk on every request, specifically so scripts like this one and
 * mock/live-measurements.js don't require a restart — see
 * refreshMeasurementsFromDisk() there.)
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPrng } from "./lib/prng.js";
import { createResumingIdFactory } from "./lib/ids.js";
import { nextMeasurementRow, STEP_MS } from "./lib/measurement-gen.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");
const HOUR_MS = 3_600_000;

// Fixed seed so a gap's power-profile values are reproducible given the same
// db.json and the same moment in time — same convention as mock/seed.js and
// mock/add-spare-devices.js (never Math.random() in the mock data pipeline).
const FILL_SEED = 0xF111;

/**
 * Mutates db.measurements in place, appending rows for every device that has
 * an active device-homes link and at least one existing measurement to
 * continue from. Returns a per-device summary.
 */
export function fillMeasurementGaps(db, { now = new Date(), seed = FILL_SEED } = {}) {
  for (const key of ["measurements", "devices", "device-homes", "appliance-types"]) {
    if (!Array.isArray(db[key])) throw new Error(`Collection "${key}" is missing or not an array in db.json`);
  }

  const rand = createPrng(seed);
  const nowMs = now.getTime();

  const activeDeviceIds = new Set(
    db["device-homes"].filter((r) => !r.deleted_at).map((r) => r.device_id),
  );

  const applianceNameById = new Map(db["appliance-types"].map((t) => [t.id, t.name]));

  // Single pass to find each device's most recent measurement.
  const latestByDevice = new Map();
  for (const m of db.measurements) {
    const current = latestByDevice.get(m.device_id);
    if (!current || new Date(m.date_time).getTime() > new Date(current.date_time).getTime()) {
      latestByDevice.set(m.device_id, m);
    }
  }

  const nextId = createResumingIdFactory("measurements", db.measurements);
  const summary = [];

  for (const deviceId of activeDeviceIds) {
    const device = db.devices.find((d) => d.id === deviceId && !d.deleted_at);
    if (!device) continue;

    const last = latestByDevice.get(deviceId);
    if (!last) {
      summary.push({ deviceId, name: device.name, added: 0, from: null, to: null, note: "no prior measurements, skipped" });
      continue;
    }

    const applianceKey = applianceNameById.get(device.appliance_type_id) ?? "other";
    let storedEnergyKwh = last.stored_energy;
    let previousTs = new Date(last.date_time).getTime();
    let added = 0;
    let firstAddedIso = null;
    let lastAddedIso = null;

    for (let ts = previousTs + STEP_MS; ts <= nowMs; ts += STEP_MS) {
      const date = new Date(ts);
      const deltaHours = (ts - previousTs) / HOUR_MS;
      const row = nextMeasurementRow({
        rand,
        id: nextId(),
        deviceId,
        applianceKey,
        date,
        previousStoredEnergyKwh: storedEnergyKwh,
        deltaHours,
      });
      db.measurements.push(row);
      storedEnergyKwh = row.stored_energy;
      previousTs = ts;
      added += 1;
      firstAddedIso ??= row.date_time;
      lastAddedIso = row.date_time;
    }

    summary.push({
      deviceId,
      name: device.name,
      added,
      from: firstAddedIso ?? last.date_time,
      to: lastAddedIso ?? last.date_time,
    });
  }

  return summary;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  if (!existsSync(DB_PATH)) {
    console.error(`db.json not found at ${DB_PATH}. Run "npm run mock:seed" first.`);
    process.exit(1);
  }

  const db = JSON.parse(readFileSync(DB_PATH, "utf8"));
  const summary = fillMeasurementGaps(db);
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

  const totalAdded = summary.reduce((n, s) => n + s.added, 0);
  console.log(`Added ${totalAdded} measurement(s) across ${summary.length} linked device(s):\n`);
  for (const s of summary) {
    if (s.note) {
      console.log(`  ${s.name} (${s.deviceId}): 0 added — ${s.note}`);
    } else if (s.added === 0) {
      console.log(`  ${s.name} (${s.deviceId}): 0 added — already up to date`);
    } else {
      console.log(`  ${s.name} (${s.deviceId}): +${s.added}  [${s.from} .. ${s.to}]`);
    }
  }
}
