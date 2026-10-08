import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Bell, CircuitBoard, Lightbulb, WifiOff, X, Zap } from "lucide-react";

import { useNotificationCenter } from "../../../context/useNotificationCenter";
import styles from "./NotificationToasts.module.css";

const ICONS = { connectivity: WifiOff, device: CircuitBoard, critical: Zap, warning: AlertTriangle };
const LIFETIME_MS = 8000;

const Toast = ({ alert, onClose, onOpen, t }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, LIFETIME_MS);
    return () => clearTimeout(timer);
  }, [onClose]);
  const Icon =
    alert.kind === "recommendation" ? Lightbulb : (ICONS[alert.type] ?? ICONS[alert.severity] ?? Bell);
  return (
    <div className={`${styles.toast} ${styles[alert.severity] ?? ""}`} role="status">
      <button type="button" className={styles.body} onClick={onOpen}>
        <span className={styles.icon}>
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
      <button type="button" className={styles.close} onClick={onClose} aria-label={t("toast.close")}>
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
  if (toasts.length === 0) return null;
  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map((alert) => (
        <Toast
          key={alert.id}
          alert={alert}
          t={t}
          onClose={() => dismissToast(alert.id)}
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
