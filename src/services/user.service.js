import api from "./api";

export const getMe = (config) => api.get("/users/me", config).then((r) => r.data);

export const updateMe = (payload) => api.put("/users/me", payload).then((r) => r.data);

export const getMyConfiguration = (config) => api.get("/users/me/configuration", config).then((r) => r.data);

export const updateMyConfiguration = (payload) => api.put("/users/me/configuration", payload).then((r) => r.data);
