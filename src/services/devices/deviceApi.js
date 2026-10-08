import { httpClient } from "../http/httpClient";

/**
 * Cliente de API de dispositivos y consumo de un hogar.
 * Todas las funciones devuelven datos o lanzan ApiError.
 */

const home = (homeId) => `/homes/${encodeURIComponent(homeId)}`;

/** Zona horaria del navegador: decide dónde empiezan "hoy" y "este mes". */
export const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/** @returns {Promise<Array<{idApplianceType: string, name: string}>>} */
export async function listApplianceTypes() {
  const { data } = await httpClient.get("/appliance-types");
  return data;
}

/** Dispositivos del hogar con su conectividad. */
export async function listHomeDevices(homeId) {
  const { data } = await httpClient.get(`${home(homeId)}/devices`);
  return data;
}

/**
 * Vincula un módulo (solo OWNER). La respuesta trae `apiKey` y `broker`, que se
 * envían al módulo por Bluetooth y no se vuelven a mostrar.
 * @param {{deviceCode: string, name: string, applianceTypeId: string, location?: string}} request
 */
export async function linkDevice(homeId, request) {
  const { data } = await httpClient.post(`${home(homeId)}/devices`, request);
  return data;
}

/**
 * Cambia qué electrodoméstico mide, el nombre o la ubicación (solo OWNER).
 * @param {{name: string, applianceTypeId: string, location?: string}} request
 */
export async function updateDevice(homeId, deviceId, request) {
  const { data } = await httpClient.put(`${home(homeId)}/devices/${encodeURIComponent(deviceId)}`, request);
  return data;
}

/**
 * Nueva api key y dirección del broker para un módulo ya vinculado, para escribirlas por
 * Bluetooth junto con otra red Wi-Fi (solo OWNER). La key anterior deja de valer.
 * No cuenta como una vinculación nueva.
 */
export async function reissueCredentials(homeId, deviceId) {
  const { data } = await httpClient.post(
    `${home(homeId)}/devices/${encodeURIComponent(deviceId)}/credentials`,
  );
  return data;
}

/** Desvincula un dispositivo (solo OWNER); su api key deja de valer. */
export async function unlinkDevice(homeId, deviceId) {
  await httpClient.delete(`${home(homeId)}/devices/${encodeURIComponent(deviceId)}`);
}

/** Potencia actual (W), kWh de hoy y del mes, límites y últimas 24 h. */
export async function getConsumptionSummary(homeId, zone = browserZone()) {
  const { data } = await httpClient.get(`${home(homeId)}/consumption/summary`, { params: { zone } });
  return data;
}

/** @param {"day"|"week"|"month"|"year"} period */
export async function getConsumptionHistory(homeId, period, zone = browserZone()) {
  const { data } = await httpClient.get(`${home(homeId)}/consumption/history`, {
    params: { period, zone },
  });
  return data;
}
