// Canonical room/location keys, shared by mock/add-spare-devices.js and
// mock/server.js's device-linking validation so the enum is defined once.
// Same keys as src/features/DetailHome/shared/roomTypes.js on the frontend
// and src/i18n/locales/*/devices.json's "rooms" block — see mock/README.md
// ("device.location").

export const ROOM_KEYS = ["kitchen", "livingRoom", "bedroom", "laundryRoom", "garage", "other"];
