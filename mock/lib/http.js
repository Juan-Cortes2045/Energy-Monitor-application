// Shared HTTP helpers for mock/server.js. Every error response follows the
// same { status, code, message } shape so the frontend's axios interceptor
// (src/services/api.js, Fase 3) can normalize errors identically regardless
// of which endpoint produced them.

export function errorBody(status, code, message) {
  return { status, code, message };
}

export function sendError(res, status, code, message) {
  return res.status(status).json(errorBody(status, code, message));
}

export function nowIso() {
  return new Date().toISOString();
}

export function touch(row) {
  row.updated_at = nowIso();
  return row;
}

export function softDelete(row) {
  const timestamp = nowIso();
  row.deleted_at = timestamp;
  row.updated_at = timestamp;
  return row;
}

export function isActive(row) {
  return !!row && row.deleted_at == null;
}

// Applies the artificial MOCK_DELAY (ms) before calling `next`, so loading
// states are actually visible in the UI. See mock/README.md for how to
// override it and how to force error responses for testing.
export function withDelay(delayMs) {
  return (req, res, next) => {
    if (delayMs <= 0) return next();
    setTimeout(next, delayMs);
  };
}

// Lets a manual tester force any status code via `x-mock-error: <status>`
// without having to reproduce the real failure condition.
export function forcedErrorMiddleware(req, res, next) {
  const forced = req.headers["x-mock-error"];
  if (!forced) return next();
  const status = Number(forced);
  if (!Number.isInteger(status) || status < 400 || status > 599) return next();
  return sendError(res, status, "FORCED_ERROR", `Forced ${status} response via x-mock-error header`);
}
