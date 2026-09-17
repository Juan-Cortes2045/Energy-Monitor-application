// Canonical room/location keys, matching src/i18n/locales/*/devices.json's
// "rooms" block and mock/lib/rooms.js on the mock API side. There is no
// backend catalog for rooms (unlike appliance types) — it's a fixed enum.
export const ROOM_KEYS = ["kitchen", "livingRoom", "bedroom", "laundryRoom", "garage", "other"];
