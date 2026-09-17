// Shared single-row measurement generator for mock/fill-measurements.js and
// mock/live-measurements.js: given a device's last known reading, produces
// the next measurement row with a realistic power profile
// (mock/lib/appliance-profiles.js) and a stored_energy counter that keeps
// accumulating instead of resetting.

import { randFloat } from "./prng.js";
import { powerDrawWatts } from "./appliance-profiles.js";

export const STEP_MS = 15 * 60_000;

// deltaHours is passed in (not derived from STEP_MS) so callers can account
// for an irregular gap, e.g. the first tick after the server was down for a
// while — stored_energy should reflect the real elapsed time, not always
// assume exactly 15 minutes passed.
export function nextMeasurementRow({ rand, id, deviceId, applianceKey, date, previousStoredEnergyKwh, deltaHours }) {
  const activePowerW = powerDrawWatts(rand, applianceKey, date);
  const storedEnergyKwh = previousStoredEnergyKwh + (activePowerW / 1000) * deltaHours;
  const voltage = randFloat(rand, 117, 123, 1);
  const powerFactor = randFloat(rand, 0.92, 0.98, 2);
  const current = activePowerW === 0 ? 0 : Math.round((activePowerW / (voltage * powerFactor)) * 100) / 100;
  const iso = date.toISOString();

  return {
    id,
    id_measurement: id,
    device_id: deviceId,
    date_time: iso,
    voltage,
    current,
    active_power: activePowerW,
    stored_energy: Math.round(storedEnergyKwh * 1000) / 1000,
    created_at: iso,
    updated_at: iso,
    deleted_at: null,
  };
}
