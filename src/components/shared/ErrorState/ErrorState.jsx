import { AlertTriangle, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "../../../design/components/Button/Button";
import { errorMessage } from "../../../services/http/errorMessages";
import styles from "./ErrorState.module.css";

/**
 * Pantalla de fallo al cargar datos del backend.
 * Sin respuesta del servidor (`error.status === null`) muestra "sin conexión";
 * con cualquier otro error, el texto traducido según su status (nunca el del servidor).
 *
 * @param {{ error?: { status?: number | null, message?: string } | null, onRetry: () => void }} props
 */
const ErrorState = ({ error, onRetry }) => {
  const { t } = useTranslation("errorState");
  const offline = error?.status == null;
  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <div className={styles.container} role="alert">
      <Icon size={40} className={styles.icon} />
      <p className={styles.title}>{offline ? t("connection.title") : t("generic.title")}</p>
      <p className={styles.description}>
        {offline ? t("connection.description") : errorMessage(t, error)}
      </p>
      <Button variant="primary" onClick={onRetry}>
        {t("retry")}
      </Button>
    </div>
  );
};

export default ErrorState;
