import api from "./api";

// Raw measurement rows (read-only in the mock, see mock/README.md). The UI
// normally consumes the aggregated home.service consumption/* endpoints
// instead of this directly — this exists for the rare case of inspecting a
// single device's raw readings.
export const listMeasurements = (params, config) => api.get("/measurements", { ...config, params }).then((r) => r.data);
