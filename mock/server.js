// Mock API server. Speaks the contract the real Java/Spring backend will
// speak; switching over later is changing VITE_API_URL, nothing here.
//
// Middleware order (see mock/README.md for the full rationale):
//   CORS -> body parser -> artificial delay/forced-error -> public auth &
//   catalog routes -> authentication guard -> home-scoped derived endpoints
//   (each declares its own membership/owner guard) -> alerts/recommendations/
//   users routes -> reject non-GET -> hide soft-deleted rows -> generic
//   json-server router (read-only from here on).
//
// Usage: npm run mock  (or npm run dev:full to also start the Vite dev server)

import { randomBytes } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import jsonServer from "json-server";

import {
  buildAuthUser,
  buildMeProfile,
  createAuthenticationGuard,
  createRequireHomeMember,
  maxFailedLoginAttempts,
  passwordResetExpirationMinutes,
  requireHomeOwner,
  sessionExpirationMinutes,
  signAccessToken,
} from "./lib/auth.js";
import {
  buildMeasurementIndex,
  classifyConsumptionLevel,
  historyBuckets,
  homeActivePowerW,
  homeKwhInRange,
  hourlySeries,
  kwhDelta,
  latestReading,
  startOfMonthMs,
  startOfTodayMs,
} from "./lib/consumption.js";
import { errorBody, forcedErrorMiddleware, isActive, nowIso, sendError, softDelete, touch, withDelay } from "./lib/http.js";
import { compositeId, createResumingIdFactory } from "./lib/ids.js";
import { resolveAlerts } from "./lib/alert-resolver.js";
import { ROOM_KEYS } from "./lib/rooms.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "db.json");
const PORT = Number(process.env.PORT) || 8090;
const MOCK_DELAY = process.env.MOCK_DELAY !== undefined ? Number(process.env.MOCK_DELAY) : 250;
const MOCK_VERIFICATION_CODE = "123456";
const SYSTEM_DEFAULT_DAILY_LIMIT_KWH = 8;
const SYSTEM_DEFAULT_MONTHLY_LIMIT_KWH = 240;

const router = jsonServer.router(DB_PATH);
const db = router.db; // shared lowdb instance, so custom endpoints and the generic router never disagree

// The API itself never writes to "measurements" at runtime (see the 405
// guard below) — but mock/live-measurements.js, mock/fill-measurements.js
// and mock/generate-alerts.js do, writing directly to db.json from a
// separate process while this server keeps running (see mock/README.md,
// "Telemetría continua"). live-measurements.js also auto-resolves alerts
// and flips device-status-logs after each tick. So measurements, alerts and
// device-status-logs are all refreshed from disk whenever the file's mtime
// moves forward, instead of only once at startup. The check is a cheap
// statSync, done once per incoming request, so external writes show up
// without restarting the server.
let measurementIndex = buildMeasurementIndex(db.get("measurements").value());
let collectionsMtimeMs = statSync(DB_PATH).mtimeMs;

function refreshCollectionsFromDisk() {
  let stat;
  try {
    stat = statSync(DB_PATH);
  } catch {
    return;
  }
  if (stat.mtimeMs <= collectionsMtimeMs) return;
  try {
    const raw = JSON.parse(readFileSync(DB_PATH, "utf8"));
    if (Array.isArray(raw.measurements)) {
      db.set("measurements", raw.measurements).value();
      measurementIndex = buildMeasurementIndex(raw.measurements);
    }
    if (Array.isArray(raw.alerts)) db.set("alerts", raw.alerts).value();
    if (Array.isArray(raw["device-status-logs"])) db.set("device-status-logs", raw["device-status-logs"]).value();
    collectionsMtimeMs = stat.mtimeMs;
  } catch {
    // db.json was mid-write by another process (fill/live/generate-alerts
    // script); the next request's check will pick up the completed write.
  }
}

// Runs the same auto-resolution rules as mock/live-measurements.js against
// the server's own in-memory lowdb state. Safe to mutate `.value()` results
// in place: lowdb v1 wraps the parsed db.json object without cloning it, so
// `db.get("alerts").value()` is a live reference, not a copy (the existing
// PATCH /api/alerts/:id handler below already relies on this same fact).
function resolveAlertsInPlace(now = new Date()) {
  const view = {
    alerts: db.get("alerts").value(),
    measurements: db.get("measurements").value(),
    "device-status-logs": db.get("device-status-logs").value(),
    "consumption-levels": db.get("consumption-levels").value(),
  };
  return resolveAlerts(view, { now });
}

const systemRoleUserId = db.get("system-roles").value().find((r) => r.name === "USER")?.id ?? null;

function idFactory(collection) {
  return createResumingIdFactory(collection, db.get(collection).value());
}

function auditNow() {
  const timestamp = nowIso();
  return { created_at: timestamp, updated_at: timestamp, deleted_at: null };
}

// Runtime-only randomness (new rows created through the API while the
// server is running). Not used by mock/seed.js, which must stay
// deterministic — see mock/lib/prng.js for that constraint.
function randomCodeRuntime(length, alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
  let code = "";
  for (let i = 0; i < length; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function uniqueAccessCode() {
  let code;
  do {
    code = randomCodeRuntime(8);
  } while (db.get("homes").value().some((h) => h.access_code === code));
  return code;
}

function activeDeviceIdsForHome(homeId) {
  return db
    .get("device-homes")
    .value()
    .filter((l) => l.home_id === homeId && l.deleted_at == null)
    .map((l) => l.device_id);
}

function homeIdsForUser(userId) {
  return db
    .get("user-homes")
    .value()
    .filter((r) => r.user_id === userId && r.deleted_at == null)
    .map((r) => r.home_id);
}

// severity is never persisted (see mock/README.md): CONNECTIVITY alerts are
// always a WARNING, THRESHOLD alerts are CRITICAL only when their
// consumption_level is CRITICAL, WARNING otherwise.
function alertSeverity(alert) {
  if (alert.type === "CONNECTIVITY") return "WARNING";
  const level = db.get("consumption-levels").value().find((l) => l.id === alert.consumption_level_id);
  return level?.name === "CRITICAL" ? "CRITICAL" : "WARNING";
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(withDelay(MOCK_DELAY));
app.use(forcedErrorMiddleware);
app.use("/api", (req, res, next) => {
  refreshCollectionsFromDisk();
  next();
});

// ---------------------------------------------------------------------------
// Public: auth
// ---------------------------------------------------------------------------

app.post("/api/auth/register", (req, res) => {
  const { name, last_name, email, password, cellphone = null, address = null } = req.body || {};
  if (!name || !last_name || !email || !password) {
    return sendError(res, 400, "VALIDATION_ERROR", "name, last_name, email and password are required");
  }
  const normalizedEmail = String(email).toLowerCase();
  if (db.get("users").value().some((u) => u.email === normalizedEmail)) {
    return sendError(res, 409, "EMAIL_TAKEN", "This email is already registered");
  }
  const policy = db.get("password-policies").value()[0];
  if (policy && password.length < policy.min_length) {
    return sendError(res, 400, "WEAK_PASSWORD", `Password must be at least ${policy.min_length} characters`);
  }

  const personId = idFactory("persons")();
  db.get("persons").push({
    id: personId,
    id_person: personId,
    name,
    last_name,
    cellphone,
    address,
    profile_image: null,
    ...auditNow(),
  }).value();

  const userId = idFactory("users")();
  db.get("users").push({
    id: userId,
    id_user: userId,
    person_id: personId,
    password_hash: "$2b$10$mock.placeholder.hash",
    password_plain: password,
    email: normalizedEmail,
    email_verified: false,
    registration_date: nowIso(),
    status: "INACTIVE",
    failed_login_attempts: 0,
    last_login_at: null,
    ...auditNow(),
  }).value();

  const configId = idFactory("user-configurations")();
  db.get("user-configurations").push({
    id: configId,
    id_configuration: configId,
    user_id: userId,
    notify_by_email: true,
    notify_by_push: true,
    color_theme: "energy-light",
    language: "es",
    social_provider: null,
    ...auditNow(),
  }).value();

  if (systemRoleUserId) {
    db.get("user-system-roles").push({
      id: compositeId(userId, systemRoleUserId),
      user_id: userId,
      system_role_id: systemRoleUserId,
      assigned_at: nowIso(),
      ...auditNow(),
    }).value();
  }

  db.write();
  return res.status(201).json({
    id_user: userId,
    email: normalizedEmail,
    message: `Registered. Verify your email with the mock code (${MOCK_VERIFICATION_CODE}) via POST /api/auth/verify-email.`,
  });
});

app.post("/api/auth/verify-email", (req, res) => {
  const { email, code } = req.body || {};
  const user = db.get("users").value().find((u) => u.email === String(email || "").toLowerCase());
  if (!user) return sendError(res, 404, "USER_NOT_FOUND", "No user with that email");
  if (code !== MOCK_VERIFICATION_CODE) return sendError(res, 400, "INVALID_CODE", "Invalid verification code");
  user.email_verified = true;
  user.status = "ACTIVE";
  touch(user);
  db.write();
  return res.json({ message: "Email verified" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || "").toLowerCase();
  const user = db.get("users").value().find((u) => u.email === normalizedEmail);

  const logLoginError = (errorType) => {
    const id = idFactory("login-error-logs")();
    db.get("login-error-logs").push({
      id,
      id_login_error: id,
      user_id: user ? user.id : null,
      error_type: errorType,
      description: `Login failed: ${errorType}`,
      ip_address: req.ip,
      ...auditNow(),
    }).value();
  };
  const logAudit = (userId, action, description) => {
    const id = idFactory("audit-logs")();
    db.get("audit-logs").push({
      id,
      id_audit_log: id,
      user_id: userId,
      action,
      description,
      ip_address: req.ip,
      application: "energy-monitor-web",
      ...auditNow(),
    }).value();
  };

  if (!user) {
    logLoginError("USER_NOT_FOUND");
    db.write();
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  if (user.status === "BLOCKED") {
    logLoginError("ACCOUNT_BLOCKED");
    logAudit(user.id, "LOGIN_FAILED", "Account is blocked");
    db.write();
    return sendError(res, 423, "ACCOUNT_BLOCKED", "This account is blocked due to too many failed attempts");
  }
  if (!user.email_verified) {
    logLoginError("ACCOUNT_INACTIVE");
    db.write();
    return sendError(res, 403, "EMAIL_NOT_VERIFIED", "Verify your email before logging in");
  }
  if (user.status === "INACTIVE") {
    logLoginError("ACCOUNT_INACTIVE");
    db.write();
    return sendError(res, 403, "ACCOUNT_INACTIVE", "This account is not active");
  }
  if (user.password_plain !== password) {
    user.failed_login_attempts += 1;
    logLoginError("INVALID_PASSWORD");
    logAudit(user.id, "LOGIN_FAILED", "Invalid password");
    if (user.failed_login_attempts >= maxFailedLoginAttempts(db)) {
      user.status = "BLOCKED";
    }
    touch(user);
    db.write();
    return sendError(res, 401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  user.failed_login_attempts = 0;
  user.last_login_at = nowIso();
  touch(user);

  const sessionId = idFactory("user-sessions")();
  const refreshToken = randomBytes(32).toString("hex");
  const expirationAt = new Date(Date.now() + sessionExpirationMinutes(db) * 60_000).toISOString();
  db.get("user-sessions").push({
    id: sessionId,
    id_user_session: sessionId,
    user_id: user.id,
    refresh_token: refreshToken,
    revoked: false,
    ip_address: req.ip,
    user_agent: req.headers["user-agent"] || "",
    expiration_at: expirationAt,
    closed_at: null,
    ...auditNow(),
  }).value();
  logAudit(user.id, "LOGIN", "User logged in");
  db.write();

  const accessToken = signAccessToken(db, user);
  return res.json({ accessToken, refreshToken, user: buildAuthUser(db, user) });
});

app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  const session = db.get("user-sessions").value().find((s) => s.refresh_token === refreshToken);
  if (!session) return sendError(res, 401, "INVALID_REFRESH_TOKEN", "Unknown refresh token");
  if (session.revoked) return sendError(res, 401, "REFRESH_TOKEN_REVOKED", "This session was revoked");
  if (new Date(session.expiration_at).getTime() < Date.now()) {
    return sendError(res, 401, "REFRESH_TOKEN_EXPIRED", "This session expired");
  }
  const user = db.get("users").value().find((u) => u.id === session.user_id);
  if (!user) return sendError(res, 401, "UNAUTHORIZED", "User no longer exists");
  return res.json({ accessToken: signAccessToken(db, user), refreshToken });
});

app.post("/api/auth/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  const session = db.get("user-sessions").value().find((s) => s.refresh_token === refreshToken);
  if (session) {
    session.revoked = true;
    session.closed_at = nowIso();
    touch(session);
    db.write();
  }
  return res.status(204).end();
});

app.post("/api/auth/recover-password", (req, res) => {
  const { email } = req.body || {};
  const user = db.get("users").value().find((u) => u.email === String(email || "").toLowerCase());
  if (!user) return sendError(res, 404, "USER_NOT_FOUND", "No user with that email");
  const id = idFactory("password-reset-tokens")();
  // A 6-digit numeric code, not a long hex token: matches the OTP-style input
  // the frontend's password-recovery screen already uses (see
  // src/features/auth/components/RPasswordForm/VRPassword.jsx).
  const resetToken = randomCodeRuntime(6, "0123456789");
  const expirationAt = new Date(Date.now() + passwordResetExpirationMinutes(db) * 60_000).toISOString();
  db.get("password-reset-tokens").push({
    id,
    id_reset_token: id,
    user_id: user.id,
    reset_token: resetToken,
    used: false,
    expiration_at: expirationAt,
    ...auditNow(),
  }).value();
  db.write();
  // Mock-only: the real backend emails this instead of returning it. See mock/README.md.
  return res.json({ resetToken, expiresAt: expirationAt });
});

app.post("/api/auth/reset-password", (req, res) => {
  const { token, password } = req.body || {};
  const resetRow = db.get("password-reset-tokens").value().find((r) => r.reset_token === token);
  if (!resetRow) return sendError(res, 400, "INVALID_TOKEN", "Invalid reset token");
  if (resetRow.used) return sendError(res, 400, "TOKEN_USED", "This reset token was already used");
  if (new Date(resetRow.expiration_at).getTime() < Date.now()) {
    return sendError(res, 400, "TOKEN_EXPIRED", "This reset token expired");
  }
  const user = db.get("users").value().find((u) => u.id === resetRow.user_id);
  if (!user) return sendError(res, 404, "USER_NOT_FOUND", "User not found");
  user.password_plain = password;
  user.password_hash = "$2b$10$mock.placeholder.hash";
  touch(user);
  resetRow.used = true;
  touch(resetRow);
  db.write();
  return res.json({ message: "Password updated" });
});

// ---------------------------------------------------------------------------
// Public: catalogs (implemented directly rather than via mock/routes.json's
// rewriter, so they can stay public while the raw collection names below
// require auth — see mock/README.md)
// ---------------------------------------------------------------------------

app.get("/api/catalogs/home-types", (req, res) => {
  return res.json(db.get("home-types").value().filter(isActive));
});
app.get("/api/catalogs/appliance-types", (req, res) => {
  return res.json(db.get("appliance-types").value().filter(isActive));
});

// ---------------------------------------------------------------------------
// Everything below requires Authorization: Bearer <accessToken>
// ---------------------------------------------------------------------------

const authenticationGuard = createAuthenticationGuard(db);
const requireHomeMember = createRequireHomeMember(db);
app.use("/api", authenticationGuard);

app.get("/api/auth/me", (req, res) => res.json(buildMeProfile(db, req.user)));

// --- Homes -------------------------------------------------------------

app.get("/api/homes", (req, res) => {
  const memberships = db.get("user-homes").value().filter((uh) => uh.user_id === req.user.id && uh.deleted_at == null);
  const result = memberships
    .map((uh) => {
      const home = db.get("homes").value().find((h) => h.id === uh.home_id);
      if (!home || home.deleted_at != null) return null;
      const homeType = db.get("home-types").value().find((t) => t.id === home.home_type_id);
      const ownerLink = db
        .get("user-homes")
        .value()
        .find((r) => r.home_id === home.id && r.role === "OWNER" && r.deleted_at == null);
      const ownerUser = ownerLink ? db.get("users").value().find((u) => u.id === ownerLink.user_id) : null;
      const ownerPerson = ownerUser ? db.get("persons").value().find((p) => p.id === ownerUser.person_id) : null;
      return {
        ...home,
        home_type: homeType ? { id: homeType.id, name: homeType.name } : null,
        role: uh.role,
        favorite: uh.favorite,
        owner: ownerPerson ? { id_person: ownerPerson.id, name: ownerPerson.name, last_name: ownerPerson.last_name } : null,
      };
    })
    .filter(Boolean);
  return res.json(result);
});

app.post("/api/homes", (req, res) => {
  const { name, home_type_id, address, description = null } = req.body || {};
  if (!name || !home_type_id || !address) {
    return sendError(res, 400, "VALIDATION_ERROR", "name, home_type_id and address are required");
  }
  const homeType = db.get("home-types").value().find((t) => t.id === home_type_id);
  if (!homeType || homeType.deleted_at != null) {
    return sendError(res, 400, "VALIDATION_ERROR", "Unknown home_type_id");
  }

  const homeId = idFactory("homes")();
  const home = {
    id: homeId,
    id_home: homeId,
    name,
    home_type_id,
    address,
    access_code: uniqueAccessCode(),
    description,
    creation_date: nowIso(),
    ...auditNow(),
  };
  db.get("homes").push(home).value();

  const thresholdId = idFactory("home-thresholds")();
  db.get("home-thresholds").push({
    id: thresholdId,
    id_threshold: thresholdId,
    home_id: homeId,
    daily_limit: SYSTEM_DEFAULT_DAILY_LIMIT_KWH,
    monthly_limit: SYSTEM_DEFAULT_MONTHLY_LIMIT_KWH,
    use_system_default: true,
    ...auditNow(),
  }).value();

  db.get("user-homes").push({
    id: compositeId(req.user.id, homeId),
    user_id: req.user.id,
    home_id: homeId,
    role: "OWNER",
    favorite: false,
    ...auditNow(),
  }).value();

  db.write();
  return res.status(201).json({ ...home, home_type: { id: homeType.id, name: homeType.name }, role: "OWNER", favorite: false });
});

app.post("/api/homes/join", (req, res) => {
  const { access_code } = req.body || {};
  const home = db.get("homes").value().find((h) => h.access_code === access_code && h.deleted_at == null);
  if (!home) return sendError(res, 404, "HOME_NOT_FOUND", "No home with that access code");

  const priorRow = db.get("user-homes").value().find((r) => r.home_id === home.id && r.user_id === req.user.id);
  if (priorRow && priorRow.deleted_at == null) {
    return sendError(res, 409, "ALREADY_MEMBER", "You are already a member of this home");
  }
  if (priorRow) {
    priorRow.role = "MEMBER";
    priorRow.favorite = false;
    priorRow.deleted_at = null;
    touch(priorRow);
  } else {
    db.get("user-homes").push({
      id: compositeId(req.user.id, home.id),
      user_id: req.user.id,
      home_id: home.id,
      role: "MEMBER",
      favorite: false,
      ...auditNow(),
    }).value();
  }
  db.write();
  return res.status(201).json({ ...home, role: "MEMBER", favorite: false });
});

app.get("/api/homes/:id", requireHomeMember, (req, res) => {
  const homeType = db.get("home-types").value().find((t) => t.id === req.home.home_type_id);
  const ownerLink = db
    .get("user-homes")
    .value()
    .find((r) => r.home_id === req.home.id && r.role === "OWNER" && r.deleted_at == null);
  const ownerUser = ownerLink ? db.get("users").value().find((u) => u.id === ownerLink.user_id) : null;
  const ownerPerson = ownerUser ? db.get("persons").value().find((p) => p.id === ownerUser.person_id) : null;
  return res.json({
    ...req.home,
    home_type: homeType ? { id: homeType.id, name: homeType.name } : null,
    role: req.homeRole,
    owner:
      ownerPerson && ownerUser
        ? { name: ownerPerson.name, last_name: ownerPerson.last_name, email: ownerUser.email, cellphone: ownerPerson.cellphone }
        : null,
  });
});

app.put("/api/homes/:id", requireHomeMember, requireHomeOwner, (req, res) => {
  const { name, address, description } = req.body || {};
  if (name !== undefined) req.home.name = name;
  if (address !== undefined) req.home.address = address;
  if (description !== undefined) req.home.description = description;
  touch(req.home);
  db.write();
  return res.json(req.home);
});

app.delete("/api/homes/:id", requireHomeMember, requireHomeOwner, (req, res) => {
  softDelete(req.home);
  db.get("user-homes").value().filter((r) => r.home_id === req.home.id && r.deleted_at == null).forEach(softDelete);
  db.get("device-homes").value().filter((r) => r.home_id === req.home.id && r.deleted_at == null).forEach(softDelete);
  const threshold = db.get("home-thresholds").value().find((t) => t.home_id === req.home.id && t.deleted_at == null);
  if (threshold) softDelete(threshold);
  db.write();
  return res.status(204).end();
});

app.delete("/api/homes/:id/leave", requireHomeMember, (req, res) => {
  if (req.homeRole === "OWNER") {
    return sendError(res, 409, "OWNER_CANNOT_LEAVE", "The owner cannot leave their own home");
  }
  const membership = db
    .get("user-homes")
    .value()
    .find((r) => r.home_id === req.home.id && r.user_id === req.user.id && r.deleted_at == null);
  softDelete(membership);
  db.write();
  return res.status(204).end();
});

app.patch("/api/homes/:id/favorite", requireHomeMember, (req, res) => {
  const { favorite } = req.body || {};
  if (typeof favorite !== "boolean") return sendError(res, 400, "VALIDATION_ERROR", "favorite must be a boolean");
  const membership = db
    .get("user-homes")
    .value()
    .find((r) => r.home_id === req.home.id && r.user_id === req.user.id && r.deleted_at == null);
  membership.favorite = favorite;
  touch(membership);
  db.write();
  return res.json(membership);
});

app.get("/api/homes/:id/members", requireHomeMember, (req, res) => {
  const rows = db.get("user-homes").value().filter((r) => r.home_id === req.home.id && r.deleted_at == null);
  const members = rows.map((r) => {
    const user = db.get("users").value().find((u) => u.id === r.user_id);
    const person = user ? db.get("persons").value().find((p) => p.id === user.person_id) : null;
    return {
      user_id: r.user_id,
      role: r.role,
      favorite: r.favorite,
      email: user?.email ?? null,
      name: person?.name ?? "",
      last_name: person?.last_name ?? "",
      profile_image: person?.profile_image ?? null,
    };
  });
  return res.json(members);
});

app.post("/api/homes/:id/members", requireHomeMember, requireHomeOwner, (req, res) => {
  const { email } = req.body || {};
  const user = db.get("users").value().find((u) => u.email === String(email || "").toLowerCase());
  if (!user) return sendError(res, 404, "USER_NOT_FOUND", "No user with that email");
  const priorRow = db.get("user-homes").value().find((r) => r.home_id === req.home.id && r.user_id === user.id);
  if (priorRow && priorRow.deleted_at == null) {
    return sendError(res, 409, "ALREADY_MEMBER", "This user is already a member");
  }
  if (priorRow) {
    priorRow.role = "MEMBER";
    priorRow.favorite = false;
    priorRow.deleted_at = null;
    touch(priorRow);
  } else {
    db.get("user-homes").push({
      id: compositeId(user.id, req.home.id),
      user_id: user.id,
      home_id: req.home.id,
      role: "MEMBER",
      favorite: false,
      ...auditNow(),
    }).value();
  }
  db.write();
  return res.status(201).json({ user_id: user.id, email: user.email, role: "MEMBER" });
});

app.delete("/api/homes/:id/members/:userId", requireHomeMember, requireHomeOwner, (req, res) => {
  if (req.params.userId === req.user.id) {
    return sendError(res, 409, "CANNOT_REMOVE_SELF", "Owners cannot remove themselves");
  }
  const membership = db
    .get("user-homes")
    .value()
    .find((r) => r.home_id === req.home.id && r.user_id === req.params.userId && r.deleted_at == null);
  if (!membership) return sendError(res, 404, "MEMBER_NOT_FOUND", "This user is not a member of this home");
  softDelete(membership);
  db.write();
  return res.status(204).end();
});

app.get("/api/homes/:id/thresholds", requireHomeMember, (req, res) => {
  const threshold = db.get("home-thresholds").value().find((t) => t.home_id === req.home.id && t.deleted_at == null);
  if (!threshold) return sendError(res, 404, "THRESHOLD_NOT_FOUND", "No thresholds configured for this home");
  return res.json(threshold);
});

app.put("/api/homes/:id/thresholds", requireHomeMember, requireHomeOwner, (req, res) => {
  const { daily_limit, monthly_limit, use_system_default } = req.body || {};
  if (typeof daily_limit !== "number" || typeof monthly_limit !== "number") {
    return sendError(res, 400, "VALIDATION_ERROR", "daily_limit and monthly_limit must be numbers");
  }
  if (daily_limit > monthly_limit) {
    return sendError(res, 400, "VALIDATION_ERROR", "daily_limit must be less than or equal to monthly_limit");
  }
  const threshold = db.get("home-thresholds").value().find((t) => t.home_id === req.home.id && t.deleted_at == null);
  if (!threshold) return sendError(res, 404, "THRESHOLD_NOT_FOUND", "No thresholds configured for this home");
  threshold.daily_limit = daily_limit;
  threshold.monthly_limit = monthly_limit;
  threshold.use_system_default = !!use_system_default;
  touch(threshold);
  db.write();
  return res.json(threshold);
});

app.get("/api/homes/:id/devices", requireHomeMember, (req, res) => {
  const links = db.get("device-homes").value().filter((l) => l.home_id === req.home.id && l.deleted_at == null);
  const devices = links
    .map((link) => {
      const device = db.get("devices").value().find((d) => d.id === link.device_id && d.deleted_at == null);
      if (!device) return null;
      const applianceType = db.get("appliance-types").value().find((t) => t.id === device.appliance_type_id);
      const latestStatus = db
        .get("device-status-logs")
        .value()
        .filter((s) => s.device_id === device.id)
        .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))[0];
      const sorted = measurementIndex.get(device.id);
      const reading = latestReading(sorted);
      return {
        ...device,
        appliance_type: applianceType ? { id: applianceType.id, name: applianceType.name } : null,
        status: latestStatus?.status ?? "OFFLINE",
        signal_strength: latestStatus?.signal_strength ?? 0,
        last_seen: latestStatus?.last_seen ?? null,
        active_power_w: reading?.active_power ?? 0,
        consumption_today_kwh: kwhDelta(sorted, startOfTodayMs(), Date.now()),
      };
    })
    .filter(Boolean);
  return res.json(devices);
});

app.post("/api/homes/:id/devices", requireHomeMember, requireHomeOwner, (req, res) => {
  const { device_code, appliance_type_id, location } = req.body || {};
  const device = db.get("devices").value().find((d) => d.device_code === device_code && d.deleted_at == null);
  if (!device) return sendError(res, 404, "DEVICE_NOT_FOUND", "No device with that code");
  const activeLink = db.get("device-homes").value().find((l) => l.device_id === device.id && l.deleted_at == null);
  if (activeLink) return sendError(res, 409, "DEVICE_ALREADY_LINKED", "This device is already linked to a home");

  // The physical hardware has no display and can't self-report what
  // appliance it monitors, so the person linking it must assign both here —
  // this is the only moment that ever sets these fields (see
  // mock/add-spare-devices.js, where a spare device starts out with both
  // null).
  if (!appliance_type_id || !location) {
    return sendError(res, 400, "VALIDATION_ERROR", "appliance_type_id and location are required");
  }
  const applianceType = db.get("appliance-types").value().find((t) => t.id === appliance_type_id);
  if (!applianceType || applianceType.deleted_at != null) {
    return sendError(res, 400, "VALIDATION_ERROR", "Unknown appliance_type_id");
  }
  if (!ROOM_KEYS.includes(location)) {
    return sendError(res, 400, "VALIDATION_ERROR", "Unknown location");
  }

  const priorLink = db.get("device-homes").value().find((l) => l.device_id === device.id && l.home_id === req.home.id);
  if (priorLink) {
    priorLink.deleted_at = null;
    touch(priorLink);
  } else {
    db.get("device-homes").push({
      id: compositeId(device.id, req.home.id),
      device_id: device.id,
      home_id: req.home.id,
      ...auditNow(),
    }).value();
  }
  device.appliance_type_id = appliance_type_id;
  device.location = location;
  touch(device);
  db.write();

  // A re-linked device may have just gotten fresh measurements (see
  // mock/lib/alert-resolver.js), which can clear its CONNECTIVITY alert
  // before the next mock/live-measurements.js tick. There is no endpoint
  // that accepts new measurements directly (all non-GET on that collection
  // hits the generic 405 guard below), so this is the only other write path
  // besides GET /api/alerts and the live-measurements tick that needs this.
  const resolved = resolveAlertsInPlace();
  if (resolved.threshold + resolved.connectivity > 0) db.write();

  return res.status(201).json(device);
});

// Testing convenience, NOT a stand-in for a real-backend endpoint: lists
// every unlinked device's code so a tester doesn't have to open db.json to
// find one to type into LinkDeviceModal. A real backend would never expose
// "every unclaimed device in the whole system" to any authenticated user —
// see mock/README.md.
app.get("/api/devices/spare", (req, res) => {
  const linkedIds = new Set(
    db.get("device-homes").value().filter((l) => l.deleted_at == null).map((l) => l.device_id),
  );
  const spares = db
    .get("devices")
    .value()
    .filter((d) => d.deleted_at == null && !linkedIds.has(d.id))
    .map((d) => ({ id: d.id, device_code: d.device_code, name: d.name, appliance_type_id: d.appliance_type_id }));
  return res.json(spares);
});

app.delete("/api/homes/:id/devices/:deviceId", requireHomeMember, requireHomeOwner, (req, res) => {
  const link = db
    .get("device-homes")
    .value()
    .find((l) => l.home_id === req.home.id && l.device_id === req.params.deviceId && l.deleted_at == null);
  if (!link) return sendError(res, 404, "DEVICE_NOT_FOUND", "This device is not linked to this home");
  softDelete(link);
  db.write();
  return res.status(204).end();
});

// --- Consumption ---------------------------------------------------------

app.get("/api/homes/:id/consumption/summary", requireHomeMember, (req, res) => {
  const deviceIds = activeDeviceIdsForHome(req.home.id);
  const threshold = db.get("home-thresholds").value().find((t) => t.home_id === req.home.id && t.deleted_at == null);
  const consumptionLevels = db.get("consumption-levels").value();

  const todayKwh = homeKwhInRange(deviceIds, measurementIndex, startOfTodayMs(), Date.now());
  const monthKwh = homeKwhInRange(deviceIds, measurementIndex, startOfMonthMs(), Date.now());
  const level = classifyConsumptionLevel(consumptionLevels, todayKwh);

  const onlineCount = deviceIds.filter((deviceId) => {
    const logs = db
      .get("device-status-logs")
      .value()
      .filter((s) => s.device_id === deviceId)
      .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));
    return logs[0]?.status === "ONLINE";
  }).length;

  return res.json({
    active_power_w: homeActivePowerW(deviceIds, measurementIndex),
    power_level: level.name,
    consumption_today_kwh: todayKwh,
    daily: { limit: threshold?.daily_limit ?? null, used: todayKwh },
    monthly: { limit: threshold?.monthly_limit ?? null, used: monthKwh },
    devices: { online: onlineCount, total: deviceIds.length },
  });
});

app.get("/api/homes/:id/consumption/hourly", requireHomeMember, (req, res) => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? req.query.date : new Date().toISOString().slice(0, 10);
  const deviceIds = activeDeviceIdsForHome(req.home.id);
  return res.json(hourlySeries(date, deviceIds, measurementIndex));
});

app.get("/api/homes/:id/consumption/distribution", requireHomeMember, (req, res) => {
  const deviceIds = activeDeviceIdsForHome(req.home.id);
  const byType = new Map();
  for (const deviceId of deviceIds) {
    const device = db.get("devices").value().find((d) => d.id === deviceId);
    if (!device) continue;
    const kwh = kwhDelta(measurementIndex.get(deviceId), startOfTodayMs(), Date.now());
    byType.set(device.appliance_type_id, (byType.get(device.appliance_type_id) || 0) + kwh);
  }
  const total = [...byType.values()].reduce((a, b) => a + b, 0);
  const result = [...byType.entries()].map(([appliance_type_id, kwh]) => ({
    appliance_type_id,
    consumption_kwh: Math.round(kwh * 1000) / 1000,
    percentage: total > 0 ? Math.round((kwh / total) * 1000) / 10 : 0,
  }));
  return res.json(result);
});

app.get("/api/homes/:id/consumption/history", requireHomeMember, (req, res) => {
  const range = ["day", "week", "month", "year"].includes(req.query.range) ? req.query.range : "week";
  const deviceIds = activeDeviceIdsForHome(req.home.id);
  const devices = deviceIds.map((deviceId) => db.get("devices").value().find((d) => d.id === deviceId)).filter(Boolean);
  const buckets = historyBuckets(range);
  const result = buckets.map((bucket) => {
    const entry = { label: bucket.label };
    for (const device of devices) {
      const kwh = kwhDelta(measurementIndex.get(device.id), bucket.from, bucket.to);
      entry[device.appliance_type_id] = Math.round(((entry[device.appliance_type_id] || 0) + kwh) * 1000) / 1000;
    }
    return entry;
  });
  return res.json(result);
});

// --- Alerts & Recommendations --------------------------------------------

app.get("/api/alerts", (req, res) => {
  // Always resolve against the freshest possible state, even if
  // mock/live-measurements.js hasn't ticked yet since the condition changed.
  const resolved = resolveAlertsInPlace();
  if (resolved.threshold + resolved.connectivity > 0) db.write();

  const { home_id, status } = req.query;
  const allowedHomeIds = homeIdsForUser(req.user.id);
  if (home_id && !allowedHomeIds.includes(home_id)) {
    return sendError(res, 403, "FORBIDDEN", "You are not a member of this home");
  }
  let rows = db.get("alerts").value().filter((a) => a.deleted_at == null && allowedHomeIds.includes(a.home_id));
  if (home_id) rows = rows.filter((a) => a.home_id === home_id);
  if (status) rows = rows.filter((a) => a.alert_status === status);
  const result = rows.map((a) => ({ ...a, severity: alertSeverity(a) })).sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  return res.json(result);
});

app.patch("/api/alerts/:id", (req, res) => {
  const alert = db.get("alerts").value().find((a) => a.id === req.params.id && a.deleted_at == null);
  if (!alert) return sendError(res, 404, "ALERT_NOT_FOUND", "Alert not found");
  if (!homeIdsForUser(req.user.id).includes(alert.home_id)) {
    return sendError(res, 403, "FORBIDDEN", "You are not a member of this home");
  }
  const { alert_status } = req.body || {};
  if (alert_status !== "RESOLVED" && alert_status !== "PENDING") {
    return sendError(res, 400, "VALIDATION_ERROR", "alert_status must be PENDING or RESOLVED");
  }
  alert.alert_status = alert_status;
  touch(alert);
  db.write();
  return res.json({ ...alert, severity: alertSeverity(alert) });
});

app.get("/api/recommendations", (req, res) => {
  const { home_id, status } = req.query;
  const allowedHomeIds = homeIdsForUser(req.user.id);
  if (home_id && !allowedHomeIds.includes(home_id)) {
    return sendError(res, 403, "FORBIDDEN", "You are not a member of this home");
  }
  let rows = db.get("recommendations").value().filter((r) => r.deleted_at == null && allowedHomeIds.includes(r.home_id));
  if (home_id) rows = rows.filter((r) => r.home_id === home_id);
  if (status) rows = rows.filter((r) => r.status === status);
  rows = [...rows].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  return res.json(rows);
});

app.patch("/api/recommendations/:id", (req, res) => {
  const recommendation = db.get("recommendations").value().find((r) => r.id === req.params.id && r.deleted_at == null);
  if (!recommendation) return sendError(res, 404, "RECOMMENDATION_NOT_FOUND", "Recommendation not found");
  if (!homeIdsForUser(req.user.id).includes(recommendation.home_id)) {
    return sendError(res, 403, "FORBIDDEN", "You are not a member of this home");
  }
  const { status } = req.body || {};
  if (status !== "READ" && status !== "UNREAD") {
    return sendError(res, 400, "VALIDATION_ERROR", "status must be READ or UNREAD");
  }
  recommendation.status = status;
  touch(recommendation);
  db.write();
  return res.json(recommendation);
});

// --- Users -----------------------------------------------------------------

app.get("/api/users/me", (req, res) => {
  const person = db.get("persons").value().find((p) => p.id === req.user.person_id);
  return res.json({ ...person, email: req.user.email });
});

app.put("/api/users/me", (req, res) => {
  const person = db.get("persons").value().find((p) => p.id === req.user.person_id);
  if (!person) return sendError(res, 404, "PERSON_NOT_FOUND", "Person not found");
  const { name, last_name, cellphone, address, profile_image } = req.body || {};
  if (name !== undefined) person.name = name;
  if (last_name !== undefined) person.last_name = last_name;
  if (cellphone !== undefined) person.cellphone = cellphone;
  if (address !== undefined) person.address = address;
  if (profile_image !== undefined) person.profile_image = profile_image;
  touch(person);
  db.write();
  return res.json({ ...person, email: req.user.email });
});

app.get("/api/users/me/configuration", (req, res) => {
  const configuration = db.get("user-configurations").value().find((c) => c.user_id === req.user.id);
  if (!configuration) return sendError(res, 404, "CONFIGURATION_NOT_FOUND", "Configuration not found");
  return res.json(configuration);
});

app.put("/api/users/me/configuration", (req, res) => {
  const configuration = db.get("user-configurations").value().find((c) => c.user_id === req.user.id);
  if (!configuration) return sendError(res, 404, "CONFIGURATION_NOT_FOUND", "Configuration not found");
  const { notify_by_email, notify_by_push, color_theme, language } = req.body || {};
  if (notify_by_email !== undefined) configuration.notify_by_email = notify_by_email;
  if (notify_by_push !== undefined) configuration.notify_by_push = notify_by_push;
  if (color_theme !== undefined) configuration.color_theme = color_theme;
  if (language !== undefined) configuration.language = language;
  touch(configuration);
  db.write();
  return res.json(configuration);
});

// ---------------------------------------------------------------------------
// Everything from here on is read-only: no derived endpoint above claimed
// the request, so it's either one of the explicitly read-only tables
// (measurements, audit-logs, login-error-logs, permissions) or simply not
// meant to be writable directly. Simpler and safer than allow-listing
// writable collections one by one — see mock/README.md.
// ---------------------------------------------------------------------------

app.use("/api", (req, res, next) => {
  if (req.method !== "GET") {
    return sendError(res, 405, "METHOD_NOT_ALLOWED", "Direct writes are not allowed; use the documented endpoint for this action.");
  }
  next();
});

app.use("/api", (req, res, next) => {
  // json-server's router responds via res.jsonp(), which (unlike res.json())
  // stringifies and calls res.send() directly in Express — it never calls
  // res.json() at all. Both are overridden here so this filter also covers
  // our own handlers above (which do call res.json()).
  const filterBody = (body) => {
    if (Array.isArray(body)) return body.filter(isActive);
    if (body && typeof body === "object" && "deleted_at" in body && body.deleted_at != null) {
      res.status(404);
      return errorBody(404, "NOT_FOUND", "Resource not found");
    }
    return body;
  };
  const originalJson = res.json.bind(res);
  const originalJsonp = res.jsonp.bind(res);
  res.json = (body) => originalJson(filterBody(body));
  res.jsonp = (body) => originalJsonp(filterBody(body));
  next();
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}/api (delay: ${MOCK_DELAY}ms)`);
});
