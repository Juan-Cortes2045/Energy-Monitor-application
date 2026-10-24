import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Bell, CircuitBoard, Gauge, Lightbulb, WifiOff, X, Zap } from "lucide-react";

import { useNotificationCenter } from "../../../context/useNotificationCenter";
import styles from "./NotificationToasts.module.css";

const ICONS = {
  connectivity: WifiOff,
  device: CircuitBoard,
  limit: Gauge,
  critical: Zap,
  warning: AlertTriangle,
};
const LIFETIME_MS = 8000;

const Toast = ({ alert, onDismiss, onOpen, t }) => {
  // El temporizador depende solo del aviso: un re-render del centro de notificaciones
  // (sondeo, otro aviso que se cierra) no lo reinicia.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(alert.id), LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);
  const Icon =
    alert.kind === "recommendation" ? Lightbulb : (ICONS[alert.type] ?? ICONS[alert.severity] ?? Bell);
  return (
    <div className={`${styles.toast} ${styles[alert.severity] ?? ""}`}>
      <button type="button" className={styles.body} onClick={onOpen}>
        <span className={styles.icon} aria-hidden="true">
          <Icon size={18} />
        </span>
        <span>
          <strong className={styles.title}>
            {t(`${alert.key}.title`, { defaultValue: t("recommendation.generic.title") })}
          </strong>
          <span className={styles.message}>
            {t(`${alert.key}.message`, {
              home: alert.home,
              device: alert.device ?? t("recommendation.someDevice"),
            })}
          </span>
        </span>
      </button>
      <button
        type="button"
        className={styles.close}
        onClick={() => onDismiss(alert.id)}
        aria-label={t("toast.close")}
      >
        <X size={14} />
      </button>
    </div>
  );
};

/** Avisos emergentes de las alertas y recomendaciones que llegan mientras la app está abierta. */
const NotificationToasts = () => {
  const { t } = useTranslation("notifications");
  const navigate = useNavigate();
  const { toasts, dismissToast } = useNotificationCenter();
  // La región viva existe siempre (aunque esté vacía): los lectores de pantalla solo anuncian
  // lo que se añade a una región que ya estaba en la página. No mueve el foco.
  return (
    <div className={styles.stack} role="status" aria-live="polite" aria-relevant="additions">
      {toasts.map((alert) => (
        <Toast
          key={alert.id}
          alert={alert}
          t={t}
          onDismiss={dismissToast}
          onOpen={() => {
            dismissToast(alert.id);
            navigate("/notifications");
          }}
        />
      ))}
    </div>
  );
};

export default NotificationToasts;
