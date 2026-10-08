import { httpClient } from "../http/httpClient";

/** Recomendaciones del hogar, de la más reciente a la más antigua. */
export const listRecommendations = (homeId) =>
  httpClient.get("/recommendations", { params: { homeId } }).then((r) => r.data);

export const markRecommendationRead = (idRecommendation) =>
  httpClient
    .put(`/recommendations/${encodeURIComponent(idRecommendation)}/read`)
    .then((r) => r.data);

/** Solo recomendaciones ya leídas. */
export const deleteRecommendation = (idRecommendation) =>
  httpClient.delete(`/recommendations/${encodeURIComponent(idRecommendation)}`);

/** Elimina todas las recomendaciones leídas del hogar. */
export const deleteReadRecommendations = (homeId) =>
  httpClient.delete("/recommendations", { params: { homeId } }).then((r) => r.data);

// Backend (RecommendationResponse) -> forma que pinta la UI. El messageKey del backend
// (recommendation.peakHours, .standby, .aboveAverage, .limitProjection, .deviceIncrease) es
// directamente la clave i18n de notifications.json.
export function toUiRecommendation(r, homeName) {
  return {
    id: r.idRecommendation,
    kind: "recommendation",
    type: r.type,
    severity: "info",
    key: r.messageKey,
    home: homeName,
    homeId: r.homeId,
    device: r.deviceName,
    date: r.dateTime,
    read: r.status === "READ",
  };
}
