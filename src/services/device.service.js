import api from "./api";

export const listDevices = (homeId, config) => api.get(`/homes/${homeId}/devices`, config).then((r) => r.data);

export const linkDevice = (homeId, { deviceCode, applianceTypeId, location }) =>
  api
    .post(`/homes/${homeId}/devices`, {
      device_code: deviceCode,
      appliance_type_id: applianceTypeId,
      location,
    })
    .then((r) => r.data);

export const unlinkDevice = (homeId, deviceId) =>
  api.delete(`/homes/${homeId}/devices/${deviceId}`).then((r) => r.data);

// Testing convenience only — see mock/README.md ("Testing conveniences").
// Lists unlinked devices' codes so LinkDeviceModal can show them without
// anyone having to open db.json. No equivalent will exist on the real
// backend.
export const listSpareDevices = (config) => api.get("/devices/spare", config).then((r) => r.data);
