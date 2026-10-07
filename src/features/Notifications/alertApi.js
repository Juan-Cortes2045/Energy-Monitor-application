import { httpClient } from "../../services/home/httpClient";

export const listAlerts = (homeId) =>
  httpClient.get("/alerts", { params: { homeId } }).then((r) => r.data);

export const resolveAlert = (idAlert) =>
  httpClient.put(`/alerts/${idAlert}/resolve`).then((r) => r.data);

// Backend (AlertResponse) -> forma que pinta la UI. Las claves i18n existentes
// son threshold.* y connectivity.*; messageKey del backend: alert.threshold.{high|critical}.
export function toUiAlert(a, homeName) {
  const critical = a.messageKey?.endsWith("critical");
  const connectivity = a.type === "CONNECTIVITY";
  return {
    id: a.idAlert,
    kind: "alert",
    type: connectivity ? "connectivity" : "threshold",
    severity: critical ? "critical" : "warning",
    key: connectivity
      ? "connectivity.deviceOffline"
      : critical
        ? "threshold.dailyExceeded"
        : "threshold.monthlyApproaching",
    home: homeName,
    date: a.dateTime,
    resolved: a.alertStatus === "RESOLVED",
  };
}
