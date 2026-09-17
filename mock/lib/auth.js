// JWT issuing/verification, permission resolution and the two auth guards
// used by mock/server.js. Kept separate from server.js because it's the
// part most likely to need careful review when this gets replaced by the
// real Spring Security backend.

import jwt from "jsonwebtoken";
import { sendError } from "./http.js";

// Dev-only secret. Never used against anything but this mock; the real
// backend will have its own secret management (Spring config / vault).
export const JWT_SECRET = "energy-monitor-mock-dev-secret";

function getConfigNumber(db, configName, fallback) {
  const row = db.get("security-configurations").find({ config_name: configName }).value();
  const parsed = row ? Number(row.config_value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function accessTokenExpirationMinutes(db) {
  return getConfigNumber(db, "ACCESS_TOKEN_EXPIRATION_MINUTES", 15);
}

export function sessionExpirationMinutes(db) {
  return getConfigNumber(db, "SESSION_EXPIRATION_MINUTES", 43200);
}

export function passwordResetExpirationMinutes(db) {
  return getConfigNumber(db, "PASSWORD_RESET_EXPIRATION_MINUTES", 30);
}

export function maxFailedLoginAttempts(db) {
  return getConfigNumber(db, "MAX_FAILED_LOGIN_ATTEMPTS", 3);
}

export function signAccessToken(db, user) {
  const expiresIn = `${accessTokenExpirationMinutes(db)}m`;
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn });
}

// Global (system-role-based) roles/permissions. These are separate from the
// per-home OWNER/MEMBER role stored on user-homes, which is what actually
// gates home-scoped write actions — see mock/README.md.
export function resolveRolesAndPermissions(db, userId) {
  const roleLinks = db.get("user-system-roles").filter({ user_id: userId }).value();
  const roleIds = roleLinks.map((link) => link.system_role_id);
  const roles = db
    .get("system-roles")
    .filter((role) => roleIds.includes(role.id))
    .map((role) => role.name)
    .value();

  const permissionLinks = db
    .get("system-role-permissions")
    .filter((link) => roleIds.includes(link.system_role_id))
    .value();
  const permissionIds = [...new Set(permissionLinks.map((link) => link.permission_id))];
  const permissions = db
    .get("permissions")
    .filter((permission) => permissionIds.includes(permission.id))
    .map((permission) => permission.code)
    .value();

  return { roles, permissions };
}

export function buildAuthUser(db, user) {
  const person = db.get("persons").find({ id: user.person_id }).value();
  const { roles, permissions } = resolveRolesAndPermissions(db, user.id);
  return {
    id_user: user.id,
    email: user.email,
    name: person?.name ?? "",
    last_name: person?.last_name ?? "",
    profile_image: person?.profile_image ?? null,
    roles,
    permissions,
  };
}

export function buildMeProfile(db, user) {
  const person = db.get("persons").find({ id: user.person_id }).value();
  const configuration = db.get("user-configurations").find({ user_id: user.id }).value();
  const { roles, permissions } = resolveRolesAndPermissions(db, user.id);
  return {
    id_user: user.id,
    email: user.email,
    email_verified: user.email_verified,
    status: user.status,
    person: person ?? null,
    user_configuration: configuration ?? null,
    roles,
    permissions,
  };
}

// Requires `Authorization: Bearer <accessToken>`. Attaches the live user row
// (from db, not from the token payload) to req.user so downstream handlers
// always see fresh status/role data.
export function createAuthenticationGuard(db) {
  return function authenticationGuard(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return sendError(res, 401, "UNAUTHORIZED", "Missing bearer token");
    }
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      const code = err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "UNAUTHORIZED";
      return sendError(res, 401, code, "Invalid or expired access token");
    }
    const user = db.get("users").find({ id: payload.sub }).value();
    if (!user || user.deleted_at != null) {
      return sendError(res, 401, "UNAUTHORIZED", "Invalid access token");
    }
    req.user = user;
    next();
  };
}

// Requires the authenticated user to belong to :homeId (any role). 404 if
// the home itself doesn't exist/is deleted, 403 if it exists but the user
// isn't a member — matching HomeMemberRoute's two distinct empty states on
// the frontend (Fase 4).
export function createRequireHomeMember(db) {
  return function requireHomeMember(req, res, next) {
    const homeId = req.params.homeId || req.params.id;
    const home = db.get("homes").find({ id: homeId }).value();
    if (!home || home.deleted_at != null) {
      return sendError(res, 404, "HOME_NOT_FOUND", "Home not found");
    }
    const membership = db
      .get("user-homes")
      .find((row) => row.home_id === homeId && row.user_id === req.user.id && row.deleted_at == null)
      .value();
    if (!membership) {
      return sendError(res, 403, "FORBIDDEN", "You are not a member of this home");
    }
    req.home = home;
    req.homeRole = membership.role;
    next();
  };
}

// Must run after requireHomeMember. OWNER-only actions (update/delete home,
// thresholds, link/unlink devices, invite/remove members).
export function requireHomeOwner(req, res, next) {
  if (req.homeRole !== "OWNER") {
    return sendError(res, 403, "FORBIDDEN", "Only the home owner can perform this action");
  }
  next();
}
