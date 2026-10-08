import { useContext } from "react";
import NotificationCenterContext from "./NotificationCenterContext";

/** Acceso a la bandeja de alertas (en archivo aparte por la regla de fast refresh). */
export function useNotificationCenter() {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) throw new Error("useNotificationCenter debe usarse dentro de <NotificationCenterProvider>");
  return ctx;
}
