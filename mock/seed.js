// Generates mock/db.json from scratch. Deterministic in structure and in
// values *relative to "now"*: every random choice goes through the seeded
// PRNG in mock/lib/prng.js (never Math.random()), so re-running the script
// on the same day reproduces the same relative offsets, ratios and picks.
// "Now" itself is the real wall clock, not a fixed anchor, so the absolute
// dates written to db.json (and therefore the file bytes) do change from one
// run to the next — that's required for the "today"/"this week" consumption
// endpoints to ever find data. See mock/fill-measurements.js and
// mock/live-measurements.js for how the gap between "now" and an
// already-generated db.json is kept closed without re-seeding everything.
//
// Usage: npm run mock:seed
//
// See mock/README.md for the full table-to-collection map, the seeded test
// users, and the design conventions documented here (id format, stored_energy
// semantics, consumption-level ranges, etc.).

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createIdFactory, compositeId } from "./lib/ids.js";
import { createPrng, randInt, randFloat, pick, chance, randomCode } from "./lib/prng.js";
import { powerDrawWatts } from "./lib/appliance-profiles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fixed seed, but "now" is always the real clock at run time — see the file
// header above for why.
const SEED = 20260915;
const NOW = new Date().getTime();
const NOW_ISO = new Date(NOW).toISOString();

const rand = createPrng(SEED);

const HOUR = 3_600_000;
const DAY = 86_400_000;

const isoDaysAgo = (days, hours = 0) => new Date(NOW - days * DAY - hours * HOUR).toISOString();

function audit(createdAt = NOW_ISO, updatedAt = createdAt, deletedAt = null) {
  return { created_at: createdAt, updated_at: updatedAt, deleted_at: deletedAt };
}

function fakeHash() {
  return `$2b$10$${randomCode(rand, 53, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789./")}`;
}

// ---------------------------------------------------------------------------
// Security: home-types is technically under Home Management in the MER, but
// appliance-types/permissions/system-roles are seeded first because later
// collections reference their ids.
// ---------------------------------------------------------------------------

const homeTypeId = createIdFactory("home-types");
const homeTypes = [
  { key: "house" },
  { key: "apartment" },
  { key: "studio" },
  { key: "other" },
].map(({ key }) => {
  const id = homeTypeId();
  return { id, id_home_type: id, name: key, ...audit(isoDaysAgo(600)) };
});
const homeTypeByKey = Object.fromEntries(homeTypes.map((t) => [t.name, t.id]));

const applianceTypeId = createIdFactory("appliance-types");
// Keys match src/features/DetailHome/shared/deviceTypes.js APPLIANCE_ICON so
// the frontend's lucide-react icon map keeps resolving by key.
const applianceTypes = [
  "fridge",
  "washer",
  "tv",
  "microwave",
  "ac",
  "pc",
  "waterHeater",
  "lighting",
  "other",
].map((key) => {
  const id = applianceTypeId();
  return { id, id_appliance_type: id, name: key, ...audit(isoDaysAgo(600)) };
});
const applianceTypeByKey = Object.fromEntries(applianceTypes.map((t) => [t.name, t.id]));

// consumption-level ranges are absolute daily kWh, non-overlapping, no gaps.
// See "Decisiones de diseño" in mock/README.md for why kWh (not % of the
// home's threshold) was chosen.
const consumptionLevelId = createIdFactory("consumption-levels");
const consumptionLevels = [
  { name: "LOW", min_limit: 0, max_limit: 5 },
  { name: "MEDIUM", min_limit: 5, max_limit: 15 },
  { name: "HIGH", min_limit: 15, max_limit: 30 },
  { name: "CRITICAL", min_limit: 30, max_limit: 999999 },
].map(({ name, min_limit, max_limit }) => {
  const id = consumptionLevelId();
  return {
    id,
    id_consumption_level: id,
    name,
    description: `Daily consumption between ${min_limit} and ${max_limit} kWh`,
    min_limit,
    max_limit,
    ...audit(isoDaysAgo(600)),
  };
});
const consumptionLevelByName = Object.fromEntries(consumptionLevels.map((c) => [c.name, c.id]));

const permissionId = createIdFactory("permissions");
const PERMISSION_CODES = [
  "HOME_READ",
  "HOME_UPDATE",
  "HOME_DELETE",
  "DEVICE_CREATE",
  "DEVICE_DELETE",
  "THRESHOLD_UPDATE",
  "MEMBER_INVITE",
  "MEMBER_REMOVE",
  "USER_READ",
];
const permissions = PERMISSION_CODES.map((code) => {
  const id = permissionId();
  return {
    id,
    id_permission: id,
    code,
    name: code.replace(/_/g, " ").toLowerCase(),
    description: `Grants ${code.replace(/_/g, " ").toLowerCase()} access`,
    ...audit(isoDaysAgo(600)),
  };
});
const permissionByCode = Object.fromEntries(permissions.map((p) => [p.code, p.id]));

const systemRoleId = createIdFactory("system-roles");
const systemRoles = [
  { name: "ADMIN", description: "Full system access" },
  { name: "USER", description: "Regular application user" },
].map(({ name, description }) => {
  const id = systemRoleId();
  return { id, id_system_role: id, name, description, enabled: true, ...audit(isoDaysAgo(600)) };
});
const systemRoleByName = Object.fromEntries(systemRoles.map((r) => [r.name, r.id]));

// ADMIN gets every permission, USER only gets the read-only ones. This
// global RBAC layer is independent from the per-home OWNER/MEMBER role
// stored on user-homes, which is what actually gates home-scoped actions.
const systemRolePermissions = [
  ...PERMISSION_CODES.map((code) => ({
    system_role_id: systemRoleByName.ADMIN,
    permission_id: permissionByCode[code],
  })),
  { system_role_id: systemRoleByName.USER, permission_id: permissionByCode.HOME_READ },
  { system_role_id: systemRoleByName.USER, permission_id: permissionByCode.USER_READ },
].map(({ system_role_id, permission_id }) => ({
  id: compositeId(system_role_id, permission_id),
  system_role_id,
  permission_id,
  assigned_at: isoDaysAgo(600),
  ...audit(isoDaysAgo(600)),
}));

const securityConfigurationId = createIdFactory("security-configurations");
const securityConfigurations = [
  { config_name: "MAX_FAILED_LOGIN_ATTEMPTS", config_value: "3", description: "Failed attempts before an account is auto-blocked" },
  { config_name: "ACCESS_TOKEN_EXPIRATION_MINUTES", config_value: "15", description: "JWT access token lifetime" },
  { config_name: "SESSION_EXPIRATION_MINUTES", config_value: "43200", description: "Refresh token / session lifetime (30 days)" },
  { config_name: "PASSWORD_RESET_EXPIRATION_MINUTES", config_value: "30", description: "Password reset token lifetime" },
].map(({ config_name, config_value, description }) => {
  const id = securityConfigurationId();
  return { id, id_security_configuration: id, config_name, config_value, description, ...audit(isoDaysAgo(600)) };
});

const passwordPolicyId = createIdFactory("password-policies");
const passwordPolicies = [
  {
    min_length: 8,
    max_length: 64,
    require_uppercase: true,
    require_numbers: true,
    require_symbols: true,
    expiration_days: 90,
  },
].map((p) => {
  const id = passwordPolicyId();
  return { id, id_password_policy: id, ...p, ...audit(isoDaysAgo(600)) };
});

// ---------------------------------------------------------------------------
// Security: persons / users / user-configurations
// Password rule for every seeded demo user: "Demo1234*". password_hash is a
// cosmetic placeholder — the mock login endpoint checks password_plain, see
// mock/README.md ("mock-only fields").
// ---------------------------------------------------------------------------

const personIdFactory = createIdFactory("persons");
const userIdFactory = createIdFactory("users");
const configIdFactory = createIdFactory("user-configurations");

const DEMO_PASSWORD = "Demo1234*";
const THEME_IDS = ["energy-light", "eco-light", "energy-dark", "eco-dark"];
const LANGUAGES = ["es", "en", "fr"];

const USER_SEEDS = [
  {
    email: "owner@demo.com",
    person: { name: "Laura", last_name: "Bennett", cellphone: "+13035550101", address: "482 Willow Creek Rd, Denver, CO" },
    status: "ACTIVE",
    email_verified: true,
    failed_login_attempts: 0,
    registeredDaysAgo: 200,
    lastLoginHoursAgo: 24,
  },
  {
    email: "member@demo.com",
    person: { name: "Michael", last_name: "Turner", cellphone: "+15125550102", address: "1200 Elm Street, Apt 3B, Austin, TX" },
    status: "ACTIVE",
    email_verified: true,
    failed_login_attempts: 0,
    registeredDaysAgo: 180,
    lastLoginHoursAgo: 48,
  },
  {
    email: "blocked@demo.com",
    person: { name: "Carla", last_name: "Reeves", cellphone: "+14045550103", address: "77 Birchwood Ave, Unit 5, Seattle, WA" },
    status: "BLOCKED",
    email_verified: true,
    failed_login_attempts: 3,
    registeredDaysAgo: 150,
    lastLoginHoursAgo: 130,
  },
  {
    email: "unverified@demo.com",
    person: { name: "Sophie", last_name: "Dean", cellphone: "+16175550104", address: "9 Harbor View Ln, Boston, MA" },
    status: "INACTIVE",
    email_verified: false,
    failed_login_attempts: 0,
    registeredDaysAgo: 3,
    lastLoginHoursAgo: null,
  },
  {
    email: "owner2@demo.com",
    person: { name: "Anna", last_name: "Bishop", cellphone: "+12065550105", address: "310 Maple Grove Dr, Portland, OR" },
    status: "ACTIVE",
    email_verified: true,
    failed_login_attempts: 0,
    registeredDaysAgo: 220,
    lastLoginHoursAgo: 12,
  },
];

const users = [];
const persons = [];
const userConfigurations = [];

for (const seedUser of USER_SEEDS) {
  const personId = personIdFactory();
  persons.push({
    id: personId,
    id_person: personId,
    name: seedUser.person.name,
    last_name: seedUser.person.last_name,
    cellphone: seedUser.person.cellphone,
    address: seedUser.person.address,
    profile_image: null,
    ...audit(isoDaysAgo(seedUser.registeredDaysAgo)),
  });

  const userId = userIdFactory();
  users.push({
    id: userId,
    id_user: userId,
    person_id: personId,
    password_hash: fakeHash(),
    password_plain: DEMO_PASSWORD,
    email: seedUser.email.toLowerCase(),
    email_verified: seedUser.email_verified,
    registration_date: isoDaysAgo(seedUser.registeredDaysAgo),
    status: seedUser.status,
    failed_login_attempts: seedUser.failed_login_attempts,
    last_login_at: seedUser.lastLoginHoursAgo == null ? null : isoDaysAgo(0, seedUser.lastLoginHoursAgo),
    ...audit(isoDaysAgo(seedUser.registeredDaysAgo)),
  });

  const configId = configIdFactory();
  userConfigurations.push({
    id: configId,
    id_configuration: configId,
    user_id: userId,
    notify_by_email: true,
    notify_by_push: chance(rand, 0.6),
    color_theme: pick(rand, THEME_IDS),
    language: pick(rand, LANGUAGES),
    social_provider: null,
    ...audit(isoDaysAgo(seedUser.registeredDaysAgo)),
  });
}

const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]));
const ownerUser = userByEmail["owner@demo.com"];
const memberUser = userByEmail["member@demo.com"];
const blockedUser = userByEmail["blocked@demo.com"];
const owner2User = userByEmail["owner2@demo.com"];

const userSystemRoles = users.map((u) => ({
  id: compositeId(u.id, systemRoleByName.USER),
  user_id: u.id,
  system_role_id: systemRoleByName.USER,
  assigned_at: u.registration_date,
  ...audit(u.registration_date),
}));

const loginErrorLogId = createIdFactory("login-error-logs");
const loginErrorLogs = [0, 2, 4].map((minutesOffset) => {
  const id = loginErrorLogId();
  return {
    id,
    id_login_error: id,
    user_id: blockedUser.id,
    error_type: "INVALID_PASSWORD",
    description: "Invalid password attempt",
    ip_address: "203.0.113.42",
    ...audit(isoDaysAgo(5, -minutesOffset / 60)),
  };
});

const AUDIT_LOG_SEEDS = [
  { user_id: ownerUser.id, action: "LOGIN", description: "User logged in", daysAgo: 1 },
  { user_id: memberUser.id, action: "LOGIN", description: "User logged in", daysAgo: 2 },
  { user_id: owner2User.id, action: "LOGIN", description: "User logged in", daysAgo: 0.5 },
  { user_id: blockedUser.id, action: "LOGIN_FAILED", description: "Invalid password attempt", daysAgo: 5 },
  { user_id: blockedUser.id, action: "LOGIN_FAILED", description: "Invalid password attempt", daysAgo: 5 },
  { user_id: blockedUser.id, action: "LOGIN_FAILED", description: "Invalid password attempt, account blocked", daysAgo: 5 },
  { user_id: ownerUser.id, action: "CREATE", description: "Home created", daysAgo: 40 },
  { user_id: ownerUser.id, action: "CREATE", description: "Home created", daysAgo: 35 },
  { user_id: owner2User.id, action: "CREATE", description: "Home created", daysAgo: 30 },
];
const auditLogId = createIdFactory("audit-logs");
const auditLogs = AUDIT_LOG_SEEDS.map(({ user_id, action, description, daysAgo }) => {
  const id = auditLogId();
  return {
    id,
    id_audit_log: id,
    user_id,
    action,
    description,
    ip_address: "198.51.100.7",
    application: "energy-monitor-web",
    ...audit(isoDaysAgo(daysAgo)),
  };
});

// ---------------------------------------------------------------------------
// Home Management
// ---------------------------------------------------------------------------

const homeIdFactory = createIdFactory("homes");
const thresholdIdFactory = createIdFactory("home-thresholds");
const usedAccessCodes = new Set();

function uniqueAccessCode() {
  let code;
  do {
    code = randomCode(rand, 8);
  } while (usedAccessCodes.has(code));
  usedAccessCodes.add(code);
  return code;
}

const HOME_SEEDS = [
  {
    key: "main",
    name: "Main House",
    typeKey: "house",
    address: "482 Willow Creek Rd, Denver, CO",
    description: "Two-story family home with solar-ready wiring.",
    createdDaysAgo: 40,
    threshold: { daily_limit: 10, monthly_limit: 280, use_system_default: false },
    owner: ownerUser,
    members: [{ user: memberUser, favorite: false }],
    ownerFavorite: true,
  },
  {
    key: "downtown",
    name: "Downtown Apartment",
    typeKey: "apartment",
    address: "1200 Elm Street, Apt 3B, Austin, TX",
    description: "One-bedroom apartment, no linked devices yet.",
    createdDaysAgo: 35,
    threshold: { daily_limit: 8, monthly_limit: 240, use_system_default: true },
    owner: ownerUser,
    members: [],
    ownerFavorite: false,
  },
  {
    key: "studio",
    name: "Southside Studio",
    typeKey: "studio",
    address: "310 Maple Grove Dr, Portland, OR",
    description: "Compact studio with a home office corner.",
    createdDaysAgo: 30,
    threshold: { daily_limit: 12, monthly_limit: 320, use_system_default: false },
    owner: owner2User,
    members: [{ user: ownerUser, favorite: false }],
    ownerFavorite: true,
  },
];

const homes = [];
const homeThresholds = [];
const userHomes = [];
const homeByKey = {};

for (const seed of HOME_SEEDS) {
  const homeId = homeIdFactory();
  homeByKey[seed.key] = homeId;
  homes.push({
    id: homeId,
    id_home: homeId,
    name: seed.name,
    home_type_id: homeTypeByKey[seed.typeKey],
    address: seed.address,
    access_code: uniqueAccessCode(),
    description: seed.description,
    creation_date: isoDaysAgo(seed.createdDaysAgo),
    ...audit(isoDaysAgo(seed.createdDaysAgo)),
  });

  const thresholdId = thresholdIdFactory();
  homeThresholds.push({
    id: thresholdId,
    id_threshold: thresholdId,
    home_id: homeId,
    daily_limit: seed.threshold.daily_limit,
    monthly_limit: seed.threshold.monthly_limit,
    use_system_default: seed.threshold.use_system_default,
    ...audit(isoDaysAgo(seed.createdDaysAgo)),
  });

  userHomes.push({
    id: compositeId(seed.owner.id, homeId),
    user_id: seed.owner.id,
    home_id: homeId,
    role: "OWNER",
    favorite: seed.ownerFavorite,
    ...audit(isoDaysAgo(seed.createdDaysAgo)),
  });

  for (const member of seed.members) {
    userHomes.push({
      id: compositeId(member.user.id, homeId),
      user_id: member.user.id,
      home_id: homeId,
      role: "MEMBER",
      favorite: member.favorite,
      ...audit(isoDaysAgo(seed.createdDaysAgo)),
    });
  }
}

// ---------------------------------------------------------------------------
// Devices
// ---------------------------------------------------------------------------

const deviceIdFactory = createIdFactory("devices");
const usedDeviceCodes = new Set();

function uniqueDeviceCode() {
  let code;
  do {
    code = randomCode(rand, 6);
  } while (usedDeviceCodes.has(code));
  usedDeviceCodes.add(code);
  return code;
}

const DEVICE_SEEDS = [
  { homeKey: "main", applianceKey: "fridge", location: "kitchen", name: "Kitchen Fridge" },
  { homeKey: "main", applianceKey: "washer", location: "laundryRoom", name: "Laundry Washer" },
  { homeKey: "main", applianceKey: "tv", location: "livingRoom", name: "Living Room TV", offline: true },
  { homeKey: "main", applianceKey: "ac", location: "bedroom", name: "Bedroom AC" },
  { homeKey: "main", applianceKey: "lighting", location: "livingRoom", name: "Living Room Lights" },
  { homeKey: "studio", applianceKey: "fridge", location: "kitchen", name: "Studio Fridge" },
  { homeKey: "studio", applianceKey: "microwave", location: "kitchen", name: "Studio Microwave" },
  { homeKey: "studio", applianceKey: "pc", location: "other", name: "Home Office PC" },
  { homeKey: "studio", applianceKey: "waterHeater", location: "other", name: "Water Heater" },
];

const devices = [];
const deviceHomes = [];
const deviceStatusLogs = [];
const deviceStatusLogId = createIdFactory("device-status-logs");

for (const seed of DEVICE_SEEDS) {
  const deviceId = deviceIdFactory();
  const installedDaysAgo = randInt(rand, 400, 620);
  devices.push({
    id: deviceId,
    id_device: deviceId,
    name: seed.name,
    appliance_type_id: applianceTypeByKey[seed.applianceKey],
    location: seed.location,
    description: `${seed.name} smart plug monitor`,
    installation_date: isoDaysAgo(installedDaysAgo),
    device_code: uniqueDeviceCode(),
    api_key: randomCode(rand, 32, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
    ...audit(isoDaysAgo(installedDaysAgo)),
  });

  deviceHomes.push({
    id: compositeId(deviceId, homeByKey[seed.homeKey]),
    device_id: deviceId,
    home_id: homeByKey[seed.homeKey],
    ...audit(isoDaysAgo(installedDaysAgo)),
  });

  const statusId = deviceStatusLogId();
  deviceStatusLogs.push({
    id: statusId,
    id_device_status: statusId,
    device_id: deviceId,
    status: seed.offline ? "OFFLINE" : "ONLINE",
    signal_strength: seed.offline ? 0 : randInt(rand, 60, 98),
    last_seen: seed.offline ? isoDaysAgo(0, 6) : isoDaysAgo(0, randFloat(rand, 0.02, 0.5, 2)),
    ...audit(isoDaysAgo(installedDaysAgo)),
  });
}

// ---------------------------------------------------------------------------
// Measurements
//
// stored_energy is a monotonically increasing lifetime counter in kWh (like a
// utility meter), NOT a value that resets daily. Consumption over any period
// is therefore (stored_energy at period end) - (stored_energy at period
// start). active_power is the instantaneous draw in watts at that timestamp.
//
// Three resolution tiers per device, oldest to newest, so the energy counter
// accumulates correctly across the whole timeline while keeping db.json well
// under the 15MB budget (~10.8k rows total for 9 devices):
//   - days 365..31 ago: 1 sample/day (long-range "year" view)
//   - hours 720..49 ago (~day 30 to ~day 2): 1 sample/hour ("month" view)
//   - last 48h: 1 sample/15min ("day"/"week" views, close to real time)
// ---------------------------------------------------------------------------

function buildTimestampsMs() {
  const timestamps = [];
  for (let daysAgo = 365; daysAgo >= 31; daysAgo -= 1) {
    const d = new Date(NOW - daysAgo * DAY);
    d.setUTCHours(12, 0, 0, 0);
    timestamps.push(d.getTime());
  }
  for (let hoursAgo = 720; hoursAgo >= 49; hoursAgo -= 1) {
    timestamps.push(NOW - hoursAgo * HOUR);
  }
  for (let msAgo = 48 * HOUR; msAgo >= 0; msAgo -= 15 * 60_000) {
    timestamps.push(NOW - msAgo);
  }
  return timestamps;
}

const measurements = [];
const measurementIdFactory = createIdFactory("measurements");
// Keeps a couple of recent measurement ids per device, so alerts/recommendations
// below can reference a real measurement_id instead of a made-up one.
const recentMeasurementIdsByDevice = {};

const timestampsMs = buildTimestampsMs();

for (const device of devices) {
  const applianceKey = applianceTypes.find((t) => t.id === device.appliance_type_id).name;
  let storedEnergyKwh = randFloat(rand, 50, 300, 3);
  let previousTs = null;
  const recentIds = [];

  for (const ts of timestampsMs) {
    const date = new Date(ts);
    const activePowerW = powerDrawWatts(rand, applianceKey, date);
    if (previousTs !== null) {
      const deltaHours = (ts - previousTs) / HOUR;
      storedEnergyKwh += (activePowerW / 1000) * deltaHours;
    }
    previousTs = ts;

    const voltage = randFloat(rand, 117, 123, 1);
    const powerFactor = randFloat(rand, 0.92, 0.98, 2);
    const current = activePowerW === 0 ? 0 : Math.round((activePowerW / (voltage * powerFactor)) * 100) / 100;

    const id = measurementIdFactory();
    measurements.push({
      id,
      id_measurement: id,
      device_id: device.id,
      date_time: date.toISOString(),
      voltage,
      current,
      active_power: activePowerW,
      stored_energy: Math.round(storedEnergyKwh * 1000) / 1000,
      ...audit(date.toISOString()),
    });

    recentIds.push(id);
    if (recentIds.length > 5) recentIds.shift();
  }

  recentMeasurementIdsByDevice[device.id] = recentIds;
}

const deviceByLabel = Object.fromEntries(devices.map((d) => [d.name, d]));

// ---------------------------------------------------------------------------
// Alerts & Recommendations
// message_key values are resolved through i18n on the frontend (src/i18n/locales/{es,en,fr}/notifications.json), never rendered as raw text.
// severity is NOT stored here — the mock server computes it from
// consumption_level_id (or the CONNECTIVITY rule) when serving GET /api/alerts.
// ---------------------------------------------------------------------------

function pickMeasurementId(deviceId) {
  const ids = recentMeasurementIdsByDevice[deviceId];
  return ids[ids.length - 1];
}

const ALERT_SEEDS = [
  { homeKey: "main", deviceLabel: "Kitchen Fridge", type: "THRESHOLD", level: "HIGH", messageKey: "threshold.dailyExceeded", status: "PENDING", hoursAgo: 2 },
  { homeKey: "main", deviceLabel: "Living Room TV", type: "CONNECTIVITY", level: null, messageKey: "connectivity.deviceOffline", status: "PENDING", hoursAgo: 6 },
  { homeKey: "main", deviceLabel: "Bedroom AC", type: "THRESHOLD", level: "CRITICAL", messageKey: "threshold.dailyExceeded", status: "RESOLVED", hoursAgo: 30 },
  { homeKey: "studio", deviceLabel: "Water Heater", type: "THRESHOLD", level: "MEDIUM", messageKey: "threshold.monthlyApproaching", status: "PENDING", hoursAgo: 10 },
  { homeKey: "studio", deviceLabel: "Studio Microwave", type: "CONNECTIVITY", level: null, messageKey: "connectivity.deviceOffline", status: "RESOLVED", hoursAgo: 72 },
  { homeKey: "main", deviceLabel: null, type: "THRESHOLD", level: "HIGH", messageKey: "threshold.dailyExceeded", status: "PENDING", hoursAgo: 1 },
  { homeKey: "studio", deviceLabel: null, type: "THRESHOLD", level: "MEDIUM", messageKey: "threshold.monthlyApproaching", status: "RESOLVED", hoursAgo: 96 },
];

function firstDeviceInHome(homeId) {
  const link = deviceHomes.find((dh) => dh.home_id === homeId);
  return link ? devices.find((d) => d.id === link.device_id) : null;
}

const alertId = createIdFactory("alerts");
const alerts = ALERT_SEEDS.map((seed) => {
  const id = alertId();
  const referenceDevice = seed.deviceLabel ? deviceByLabel[seed.deviceLabel] : firstDeviceInHome(homeByKey[seed.homeKey]);
  return {
    id,
    id_alert: id,
    home_id: homeByKey[seed.homeKey],
    device_id: seed.deviceLabel ? referenceDevice.id : null,
    type: seed.type,
    message_key: seed.messageKey,
    date_time: isoDaysAgo(0, seed.hoursAgo),
    alert_status: seed.status,
    consumption_level_id: seed.level ? consumptionLevelByName[seed.level] : null,
    measurement_id: referenceDevice ? pickMeasurementId(referenceDevice.id) : null,
    ...audit(isoDaysAgo(0, seed.hoursAgo)),
  };
});

const RECOMMENDATION_SEEDS = [
  { homeKey: "main", deviceLabel: "Kitchen Fridge", messageKey: "recommendation.scheduleMaintenance", status: "UNREAD", hoursAgo: 24 },
  { homeKey: "main", deviceLabel: null, messageKey: "recommendation.shiftUsageOffPeak", status: "UNREAD", hoursAgo: 48 },
  { homeKey: "studio", deviceLabel: "Water Heater", messageKey: "recommendation.reduceStandby", status: "READ", hoursAgo: 120 },
  { homeKey: "studio", deviceLabel: "Home Office PC", messageKey: "recommendation.upgradeAppliance", status: "UNREAD", hoursAgo: 144 },
  { homeKey: "downtown", deviceLabel: null, messageKey: "recommendation.shiftUsageOffPeak", status: "READ", hoursAgo: 72 },
];

const recommendationId = createIdFactory("recommendations");
const recommendations = RECOMMENDATION_SEEDS.map((seed) => {
  const id = recommendationId();
  return {
    id,
    id_recommendation: id,
    home_id: homeByKey[seed.homeKey],
    device_id: seed.deviceLabel ? deviceByLabel[seed.deviceLabel].id : null,
    message_key: seed.messageKey,
    date_time: isoDaysAgo(0, seed.hoursAgo),
    status: seed.status,
    ...audit(isoDaysAgo(0, seed.hoursAgo)),
  };
});

// ---------------------------------------------------------------------------
// Assemble db.json. Sessions and password-reset-tokens start empty: they are
// created at runtime by the auth endpoints in mock/server.js (Fase 2).
// ---------------------------------------------------------------------------

const db = {
  persons,
  users,
  "user-configurations": userConfigurations,
  "password-reset-tokens": [],
  "user-sessions": [],
  "security-configurations": securityConfigurations,
  "password-policies": passwordPolicies,
  "login-error-logs": loginErrorLogs,
  "system-roles": systemRoles,
  "user-system-roles": userSystemRoles,
  permissions,
  "system-role-permissions": systemRolePermissions,
  "audit-logs": auditLogs,
  "home-types": homeTypes,
  homes,
  "home-thresholds": homeThresholds,
  "user-homes": userHomes,
  "appliance-types": applianceTypes,
  devices,
  "device-status-logs": deviceStatusLogs,
  "device-homes": deviceHomes,
  measurements,
  "consumption-levels": consumptionLevels,
  alerts,
  recommendations,
};

const outPath = join(__dirname, "db.json");
writeFileSync(outPath, JSON.stringify(db, null, 2));

const sizeMb = (Buffer.byteLength(JSON.stringify(db)) / (1024 * 1024)).toFixed(2);
console.log(`mock/db.json written: ${measurements.length} measurements, ${sizeMb} MB (raw).`);
