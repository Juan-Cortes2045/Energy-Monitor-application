// Aggregation helpers for the /homes/:id/consumption/* derived endpoints.
// These compute over the `measurement` table at request time; nothing here
// is persisted (measurements are seeded once and read-only, see
// mock/README.md).
//
// Convention reminder: `active_power` (W) is instantaneous, `stored_energy`
// (kWh) is a monotonically increasing lifetime counter. Consumption over a
// period = stored_energy at the end of the period minus stored_energy at
// the start — see kwhDelta below.

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

export function buildMeasurementIndex(measurements) {
  const byDevice = new Map();
  for (const m of measurements) {
    if (!byDevice.has(m.device_id)) byDevice.set(m.device_id, []);
    byDevice.get(m.device_id).push(m);
  }
  for (const list of byDevice.values()) {
    list.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());
  }
  return byDevice;
}

// Binary search: last reading at or before `ts` (device readings are sorted
// ascending by date_time).
function valueAtOrBefore(sorted, ts) {
  if (!sorted || sorted.length === 0) return null;
  let lo = 0;
  let hi = sorted.length - 1;
  let result = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (new Date(sorted[mid].date_time).getTime() <= ts) {
      result = sorted[mid];
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result;
}

// kWh consumed by one device between [fromMs, toMs). Returns 0 if there is
// no reading to anchor the start of the range to (e.g. before the device's
// first ever measurement) — a deliberate mock simplification, documented in
// mock/README.md.
export function kwhDelta(sorted, fromMs, toMs) {
  const end = valueAtOrBefore(sorted, toMs);
  if (!end) return 0;
  const start = valueAtOrBefore(sorted, fromMs);
  if (!start) return 0;
  return Math.max(0, Math.round((end.stored_energy - start.stored_energy) * 1000) / 1000);
}

export function latestReading(sorted, atMs = Date.now()) {
  return valueAtOrBefore(sorted, atMs);
}

export function classifyConsumptionLevel(consumptionLevels, kwh) {
  const match = consumptionLevels.find((l) => kwh >= l.min_limit && kwh < l.max_limit);
  return match ?? consumptionLevels[consumptionLevels.length - 1];
}

export function startOfTodayMs(atMs = Date.now()) {
  const d = new Date(atMs);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export function startOfMonthMs(atMs = Date.now()) {
  const d = new Date(atMs);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(1);
  return d.getTime();
}

// Sum of every device's active_power at (or just before) `atMs`.
export function homeActivePowerW(deviceIds, measurementIndex, atMs = Date.now()) {
  let total = 0;
  for (const deviceId of deviceIds) {
    const reading = latestReading(measurementIndex.get(deviceId), atMs);
    if (reading) total += reading.active_power;
  }
  return Math.round(total * 10) / 10;
}

export function homeKwhInRange(deviceIds, measurementIndex, fromMs, toMs) {
  let total = 0;
  for (const deviceId of deviceIds) {
    total += kwhDelta(measurementIndex.get(deviceId), fromMs, toMs);
  }
  return Math.round(total * 1000) / 1000;
}

// One active_power_w figure per hour of `dateStr` (YYYY-MM-DD, UTC day),
// summed across every device in the home. Averages multiple readings that
// fall in the same hour (relevant for the 15-min-resolution last 48h).
export function hourlySeries(dateStr, deviceIds, measurementIndex) {
  const dayStart = new Date(`${dateStr}T00:00:00.000Z`).getTime();
  const hours = [];
  for (let h = 0; h < 24; h += 1) {
    const hourStart = dayStart + h * HOUR_MS;
    const hourEnd = hourStart + HOUR_MS;
    let sum = 0;
    let count = 0;
    for (const deviceId of deviceIds) {
      const sorted = measurementIndex.get(deviceId) || [];
      for (const m of sorted) {
        const t = new Date(m.date_time).getTime();
        if (t >= hourStart && t < hourEnd) {
          sum += m.active_power;
          count += 1;
        }
      }
    }
    hours.push({ hour: h, active_power_w: count ? Math.round((sum / count) * 10) / 10 : 0 });
  }
  return hours;
}

// Bucket boundaries per range. Labels are machine-readable (ISO date/hour),
// never localized text — the frontend formats them with
// Intl.DateTimeFormat(i18n.language) per the Fase 5 rule against hardcoded
// day/month names.
export function historyBuckets(range, atMs = Date.now()) {
  const buckets = [];
  if (range === "day") {
    const dayStart = startOfTodayMs(atMs);
    for (let h = 0; h < 24; h += 1) {
      const from = dayStart + h * HOUR_MS;
      buckets.push({ label: String(h).padStart(2, "0"), from, to: from + HOUR_MS });
    }
  } else if (range === "week" || range === "month") {
    const days = range === "week" ? 6 : 29;
    for (let d = days; d >= 0; d -= 1) {
      const from = startOfTodayMs(atMs) - d * DAY_MS;
      buckets.push({ label: new Date(from).toISOString().slice(0, 10), from, to: from + DAY_MS });
    }
  } else if (range === "year") {
    for (let m = 11; m >= 0; m -= 1) {
      const monthStart = new Date(atMs);
      monthStart.setUTCHours(0, 0, 0, 0);
      monthStart.setUTCDate(1);
      monthStart.setUTCMonth(monthStart.getUTCMonth() - m);
      const monthEnd = new Date(monthStart);
      monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1);
      buckets.push({
        label: monthStart.toISOString().slice(0, 7),
        from: monthStart.getTime(),
        to: monthEnd.getTime(),
      });
    }
  }
  return buckets;
}
