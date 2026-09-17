#!/usr/bin/env node
/**
 * Adds spare (unlinked) devices to the mock database so a brand-new user can
 * link real devices to a home they just created.
 *
 * A spare device exists in `devices` but has NO row in `device-homes`, which is
 * exactly what `POST /api/homes/:id/devices` expects when it looks up a
 * `device_code`. Like real unconfigured hardware, a spare device has
 * `appliance_type_id: null` and `location: null` — those only get set when a
 * person links it and picks them in LinkDeviceModal (see the validation in
 * `POST /api/homes/:id/devices`).
 *
 * Usage:
 *   node mock/add-spare-devices.js                 # adds 12 spares to mock/db.json
 *   node mock/add-spare-devices.js --count 20
 *   node mock/add-spare-devices.js --no-measurements
 *   node mock/add-spare-devices.js --db ./mock/db.json --force
 *
 * Re-running is safe: it refuses to add more if enough spares already exist,
 * unless --force is passed. Codes are deterministic (fixed PRNG seed), so the
 * same run always produces the same list.
 *
 * IMPORTANT: mock/server.js keeps the whole db in memory and rewrites
 * db.json on every write it handles. Run this script BEFORE starting the
 * server, or restart the server afterwards — otherwise the server's next
 * write will overwrite the file with its stale in-memory state and silently
 * drop whatever this script added.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createPrng, randInt, randomCode } from "./lib/prng.js";
import { createResumingIdFactory } from "./lib/ids.js";

// ---------------------------------------------------------------- CLI

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const DB_PATH = path.resolve(flag("db", "mock/db.json"));
const COUNT = Number(flag("count", 12));
const WITH_MEASUREMENTS = !argv.includes("--no-measurements");
const FORCE = argv.includes("--force");

// Deterministic PRNG (mulberry32, see mock/lib/prng.js) so device codes are
// stable across runs — same seed convention as mock/seed.js, just a
// different fixed seed so the two scripts never coincidentally produce the
// same codes.
const random = createPrng(0x5c0de5);

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const KEY_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Spare devices are unconfigured hardware: neither appliance_type_id nor
// location is knowable until a person links the device to a home and picks
// them in LinkDeviceModal (see mock/server.js's POST /api/homes/:id/devices
// validation) — so the synthetic 48h of measurements below always uses this
// one generic profile instead of assuming a type that hasn't been chosen
// yet. Linking later doesn't rewrite this history, same as a real meter.
const POWER_PROFILE = { other: [20, 200] };

// ---------------------------------------------------------------- main

if (!existsSync(DB_PATH)) {
  console.error(
    `db.json not found at ${DB_PATH}. Run "npm run mock:seed" first, or pass --db <path>.`,
  );
  process.exit(1);
}

const db = JSON.parse(readFileSync(DB_PATH, "utf8"));

for (const key of ["devices", "device-homes", "device-status-logs"]) {
  if (!Array.isArray(db[key])) {
    console.error(`Collection "${key}" is missing from ${DB_PATH}.`);
    process.exit(1);
  }
}
if (WITH_MEASUREMENTS && !Array.isArray(db.measurements)) db.measurements = [];

const linkedIds = new Set(
  db["device-homes"].filter((r) => !r.deleted_at).map((r) => r.device_id),
);
const existingSpares = db.devices.filter(
  (d) => !d.deleted_at && !linkedIds.has(d.id),
);

if (existingSpares.length >= COUNT && !FORCE) {
  console.log(
    `${existingSpares.length} spare device(s) already available — nothing added.`,
  );
  console.log("Codes ready to link:");
  existingSpares.forEach((d) => console.log(`  ${d.device_code}  ${d.name}`));
  console.log("\nUse --force to add more anyway.");
  process.exit(0);
}

const usedCodes = new Set(db.devices.map((d) => d.device_code));

const nextDeviceId = createResumingIdFactory("devices", db.devices);
const nextStatusId = createResumingIdFactory("device-status-logs", db["device-status-logs"]);
const nextMeasurementId = createResumingIdFactory("measurements", db.measurements ?? []);

const now = new Date();
const nowIso = now.toISOString();
const created = [];
let measurementCount = 0;

for (let i = 1; i <= COUNT; i += 1) {
  let deviceCode;
  do {
    deviceCode = randomCode(random, 6, CODE_ALPHABET);
  } while (usedCodes.has(deviceCode));
  usedCodes.add(deviceCode);

  const idDevice = nextDeviceId();

  db.devices.push({
    id: idDevice,
    id_device: idDevice,
    name: `Spare Monitor ${String(i).padStart(2, "0")}`,
    appliance_type_id: null,
    location: null,
    description: "Unassigned monitor available to link to a home",
    installation_date: nowIso,
    device_code: deviceCode,
    api_key: randomCode(random, 32, KEY_ALPHABET),
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  });

  const idStatus = nextStatusId();
  db["device-status-logs"].push({
    id: idStatus,
    id_device_status: idStatus,
    device_id: idDevice,
    status: "ONLINE",
    signal_strength: randInt(random, 72, 99),
    last_seen: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
    deleted_at: null,
  });

  if (WITH_MEASUREMENTS) {
    const [idle, peak] = POWER_PROFILE.other;
    let storedEnergy = 0;
    // 48 h at 15-minute resolution, same cadence the seed uses for recent data.
    for (let step = 192; step >= 0; step -= 1) {
      const at = new Date(now.getTime() - step * 15 * 60 * 1000);
      const hour = at.getUTCHours();
      const dutyCycle = hour >= 7 && hour <= 22 ? 0.55 : 0.15;
      const active = random() < dutyCycle;
      const activePower = active
        ? Number((idle + random() * (peak - idle)).toFixed(1))
        : Number((idle * (0.6 + random() * 0.4)).toFixed(1));
      const voltage = Number((118 + random() * 6).toFixed(1));
      const current = Number((activePower / voltage).toFixed(2));
      storedEnergy = Number((storedEnergy + (activePower * 0.25) / 1000).toFixed(3));

      const idMeasurement = nextMeasurementId();
      const atIso = at.toISOString();
      db.measurements.push({
        id: idMeasurement,
        id_measurement: idMeasurement,
        device_id: idDevice,
        date_time: atIso,
        voltage,
        current,
        active_power: activePower,
        stored_energy: storedEnergy,
        created_at: atIso,
        updated_at: atIso,
        deleted_at: null,
      });
      measurementCount += 1;
    }
  }

  created.push({ code: deviceCode, id: idDevice });
}

writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log(`Added ${created.length} spare device(s) to ${DB_PATH}`);
if (WITH_MEASUREMENTS) {
  console.log(`Added ${measurementCount} measurement(s) (last 48 h, 15-min steps)`);
}
console.log("\nDevice codes ready to link (appliance type and location are unassigned until linked):");
created.forEach((d) => console.log(`  ${d.code}`));
console.log("\nRestart the mock API if it does not watch db.json: npm run mock");
