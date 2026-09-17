import api from "./api";

export const listHomes = (config) => api.get("/homes", config).then((r) => r.data);

export const createHome = (payload) => api.post("/homes", payload).then((r) => r.data);

export const getHome = (homeId, config) => api.get(`/homes/${homeId}`, config).then((r) => r.data);

export const updateHome = (homeId, payload) => api.put(`/homes/${homeId}`, payload).then((r) => r.data);

export const deleteHome = (homeId) => api.delete(`/homes/${homeId}`).then((r) => r.data);

export const joinHome = (accessCode) => api.post("/homes/join", { access_code: accessCode }).then((r) => r.data);

export const leaveHome = (homeId) => api.delete(`/homes/${homeId}/leave`).then((r) => r.data);

export const setFavorite = (homeId, favorite) =>
  api.patch(`/homes/${homeId}/favorite`, { favorite }).then((r) => r.data);

export const listMembers = (homeId, config) => api.get(`/homes/${homeId}/members`, config).then((r) => r.data);

export const inviteMember = (homeId, email) => api.post(`/homes/${homeId}/members`, { email }).then((r) => r.data);

export const removeMember = (homeId, userId) =>
  api.delete(`/homes/${homeId}/members/${userId}`).then((r) => r.data);

export const getThresholds = (homeId, config) =>
  api.get(`/homes/${homeId}/thresholds`, config).then((r) => r.data);

export const updateThresholds = (homeId, payload) =>
  api.put(`/homes/${homeId}/thresholds`, payload).then((r) => r.data);

export const getConsumptionSummary = (homeId, config) =>
  api.get(`/homes/${homeId}/consumption/summary`, config).then((r) => r.data);

export const getConsumptionHourly = (homeId, date, config) =>
  api.get(`/homes/${homeId}/consumption/hourly`, { ...config, params: { date } }).then((r) => r.data);

export const getConsumptionDistribution = (homeId, config) =>
  api.get(`/homes/${homeId}/consumption/distribution`, config).then((r) => r.data);

export const getConsumptionHistory = (homeId, range, config) =>
  api.get(`/homes/${homeId}/consumption/history`, { ...config, params: { range } }).then((r) => r.data);
