import api from "./api";

export const listAlerts = (params, config) => api.get("/alerts", { ...config, params }).then((r) => r.data);
