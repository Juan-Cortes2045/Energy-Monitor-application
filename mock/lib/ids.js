// Primary-key convention shared by mock/seed.js and mock/server.js.
//
// Simple-collection PKs: a 3-letter prefix + a 7-digit zero-padded sequence,
// e.g. "USR0000001", "HOM0000001". The Java/Spring backend is expected to
// keep the same convention, so client code should never assume a numeric id.
//
// Composite-PK collections (many-to-many join tables) don't get a sequence:
// their "id" (the field json-server routes on) is "<parentIdA>_<parentIdB>".

export const ID_PREFIXES = {
  persons: "PER",
  users: "USR",
  "user-configurations": "CFG",
  "password-reset-tokens": "PRT",
  "user-sessions": "SES",
  "security-configurations": "SCF",
  "password-policies": "PPL",
  "login-error-logs": "LOG",
  "system-roles": "ROL",
  permissions: "PRM",
  "audit-logs": "AUD",
  "home-types": "HTY",
  homes: "HOM",
  "home-thresholds": "THR",
  "appliance-types": "ATY",
  devices: "DEV",
  "device-status-logs": "DST",
  measurements: "MSR",
  "consumption-levels": "CLV",
  alerts: "ALT",
  recommendations: "REC",
};

export function createIdFactory(collection) {
  const prefix = ID_PREFIXES[collection];
  if (!prefix) {
    throw new Error(`No id prefix configured for collection "${collection}"`);
  }
  let sequence = 0;
  return function nextId() {
    sequence += 1;
    return `${prefix}${String(sequence).padStart(7, "0")}`;
  };
}

export function compositeId(idA, idB) {
  return `${idA}_${idB}`;
}

// Like createIdFactory, but resumes the sequence after the highest existing
// id in `existingRows` instead of starting at 1. mock/server.js uses this at
// startup so new rows created through the API never collide with ids
// mock/seed.js already wrote to db.json.
export function createResumingIdFactory(collection, existingRows) {
  const prefix = ID_PREFIXES[collection];
  if (!prefix) {
    throw new Error(`No id prefix configured for collection "${collection}"`);
  }
  let sequence = existingRows.reduce((max, row) => {
    const n = Number(String(row.id).slice(prefix.length));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return function nextId() {
    sequence += 1;
    return `${prefix}${String(sequence).padStart(7, "0")}`;
  };
}
