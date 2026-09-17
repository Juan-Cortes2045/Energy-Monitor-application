// Shared appliance power-draw profiles, used by mock/seed.js,
// mock/fill-measurements.js and mock/live-measurements.js so a device's
// simulated usage pattern (duty cycle + day/night boost) never drifts
// between the scripts that generate its measurements.

import { chance, randFloat } from "./prng.js";

export const APPLIANCE_PROFILES = {
  fridge: { baseW: 90, peakW: 180, dutyCycle: 0.55 },
  washer: { baseW: 0, peakW: 650, dutyCycle: 0.06 },
  tv: { baseW: 0, peakW: 130, dutyCycle: 0.25, eveningBoost: true },
  microwave: { baseW: 0, peakW: 1100, dutyCycle: 0.02 },
  ac: { baseW: 0, peakW: 1400, dutyCycle: 0.35, dayBoost: true },
  pc: { baseW: 8, peakW: 220, dutyCycle: 0.3 },
  waterHeater: { baseW: 0, peakW: 1800, dutyCycle: 0.08, morningBoost: true },
  lighting: { baseW: 0, peakW: 60, dutyCycle: 0.3, eveningBoost: true },
  other: { baseW: 5, peakW: 90, dutyCycle: 0.2 },
};

// hour is read in UTC on purpose: db.json only ever stores UTC timestamps
// and the frontend/localizes on display, so "evening"/"day"/"morning" here
// are UTC-hour bands, not the operator's local time.
export function powerDrawWatts(rand, applianceKey, date) {
  const profile = APPLIANCE_PROFILES[applianceKey] ?? APPLIANCE_PROFILES.other;
  const hour = date.getUTCHours();
  let onProbability = profile.dutyCycle;
  if (profile.eveningBoost && hour >= 18 && hour <= 23) onProbability += 0.3;
  if (profile.dayBoost && hour >= 11 && hour <= 17) onProbability += 0.3;
  if (profile.morningBoost && hour >= 6 && hour <= 9) onProbability += 0.35;
  onProbability = Math.min(onProbability, 0.95);
  if (!chance(rand, onProbability)) return profile.baseW;
  return randFloat(rand, profile.peakW * 0.65, profile.peakW, 1);
}
