import { httpClient } from "../http/httpClient";

export const listAlerts = (homeId) =>
  httpClient.get("/alerts", { params: { homeId } }).then((r) => r.data);

/** Solo para alertas informativas (DEVICE): las demás las resuelve el sistema. */
export const markAlertRead = (idAlert) =>
  httpClient.put(`/alerts/${encodeURIComponent(idAlert)}/read`).then((r) => r.data);

/** Solo alertas ya resueltas o leídas. */
export const deleteAlert = (idAlert) => httpClient.delete(`/alerts/${encodeURIComponent(idAlert)}`);

/** Elimina todas las alertas resueltas o leídas del hogar. */
export const deleteResolvedAlerts = (homeId) =>
  httpClient.delete("/alerts", { params: { homeId } }).then((r) => r.data);

// Backend (AlertResponse) -> forma que pinta la UI. messageKey del backend:
// alert.threshold.{high|critical}, alert.connectivity.offline, alert.device.linked,
// alert.limit.{daily|monthly}.
export function toUiAlert(a, homeName) {
  const critical = a.messageKey?.endsWith("critical");
  const type =
    a.type === "CONNECTIVITY"
      ? "connectivity"
      : a.type === "DEVICE"
        ? "device"
        : a.type === "LIMIT"
          ? "limit"
          : "threshold";
  return {
    id: a.idAlert,
    kind: "alert",
    type,
    severity: type === "device" ? "info" : critical || type === "limit" ? "critical" : "warning",
    key:
      type === "connectivity"
        ? "connectivity.deviceOffline"
        : type === "device"
          ? "device.linked"
          : type === "limit"
            ? a.messageKey === "alert.limit.monthly"
              ? "limit.monthly"
              : "limit.daily"
            : critical
            ? "threshold.critical"
            : "threshold.high",
    home: homeName,
    homeId: a.homeId,
    // Problemas que el sistema cierra solo (consumo normalizado, dispositivo reconectado,
    // nuevo día o mes)
    // frente a avisos informativos que la persona marca como leídos.
    autoResolved: type !== "device",
    date: a.dateTime,
    resolved: a.alertStatus === "RESOLVED",
  };
}
