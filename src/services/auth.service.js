import api from "./api";

export const register = (payload) => api.post("/auth/register", payload).then((r) => r.data);

export const verifyEmail = (payload) => api.post("/auth/verify-email", payload).then((r) => r.data);

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);

export const refresh = (refreshToken) => api.post("/auth/refresh", { refreshToken }).then((r) => r.data);

export const logout = (refreshToken) => api.post("/auth/logout", { refreshToken }).then((r) => r.data);

export const me = (config) => api.get("/auth/me", config).then((r) => r.data);

export const recoverPassword = (payload) => api.post("/auth/recover-password", payload).then((r) => r.data);

export const resetPassword = (payload) => api.post("/auth/reset-password", payload).then((r) => r.data);
