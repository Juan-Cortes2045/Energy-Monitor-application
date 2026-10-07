import { httpClient } from "../http/httpClient";

/**
 * Cliente de API del módulo home.
 * Ningún componente debe llamar a axios directamente.
 * Todas las funciones devuelven datos o lanzan ApiError.
 */

/** @param {import("./types").CreateHomeRequest} request */
export async function createHome(request) {
  const { data } = await httpClient.post("/homes", request);
  return data;
}

/** @returns {Promise<import("./types").HomeMembership[]>} */
export async function listHomes() {
  const { data } = await httpClient.get("/homes");
  return data;
}

/** @param {import("./types").JoinHomeRequest} request */
export async function joinHome(request) {
  const { data } = await httpClient.post("/homes/join", request);
  return data;
}

/** @param {string} homeId */
export async function toggleFavorite(homeId) {
  const { data } = await httpClient.put(`/homes/${encodeURIComponent(homeId)}/favorite`);
  return data;
}

/** @param {string} homeId @param {string} userId */
export async function removeMember(homeId, userId) {
  await httpClient.delete(
    `/homes/${encodeURIComponent(homeId)}/members/${encodeURIComponent(userId)}`,
  );
}

/** @param {string} homeId @returns {Promise<import("./types").UserHome[]>} */
export async function listMembers(homeId) {
  const { data } = await httpClient.get(`/homes/${encodeURIComponent(homeId)}/members`);
  return data;
}

/** @param {string} homeId */
export async function leaveHome(homeId) {
  await httpClient.delete(`/homes/${encodeURIComponent(homeId)}/members/me`);
}

/** @param {string} homeId */
export async function getThresholds(homeId) {
  const { data } = await httpClient.get(`/homes/${encodeURIComponent(homeId)}/thresholds`);
  return data;
}

/** @param {string} homeId @param {import("./types").UpdateThresholdsRequest} request */
export async function updateThresholds(homeId, request) {
  const { data } = await httpClient.put(
    `/homes/${encodeURIComponent(homeId)}/thresholds`,
    request,
  );
  return data;
}

/** @returns {Promise<import("./types").HomeType[]>} */
export async function listHomeTypes() {
  const { data } = await httpClient.get("/home-types");
  return data;
}

/** @param {string} idHomeType */
export async function getHomeType(idHomeType) {
  const { data } = await httpClient.get(`/home-types/${encodeURIComponent(idHomeType)}`);
  return data;
}
