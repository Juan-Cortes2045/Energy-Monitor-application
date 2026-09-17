import api from "./api";

export const listRecommendations = (params, config) =>
  api.get("/recommendations", { ...config, params }).then((r) => r.data);

export const markRecommendationRead = (recommendationId) =>
  api.patch(`/recommendations/${recommendationId}`, { status: "READ" }).then((r) => r.data);
