import api from "./api";

export const listHomeTypes = (config) => api.get("/catalogs/home-types", config).then((r) => r.data);

export const listApplianceTypes = (config) => api.get("/catalogs/appliance-types", config).then((r) => r.data);
