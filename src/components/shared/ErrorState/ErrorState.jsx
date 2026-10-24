import { AlertTriangle, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import Button from "../../../design/components/Button/Button";
import { errorMessage } from "../../../services/http/errorMessages";
import styles from "./ErrorState.module.css";

/**
 * Pantalla de fallo al cargar datos del backend.
 * Sin respuesta del servidor (`error.status === null`) muestra "sin conexión";
 * con cualquier otro error, el texto traducido según su status (nunca el del servidor).
 * `title`, `description` y `retryLabel` reemplazan los textos por defecto (p. ej. un error de render).
 *
 * @param {{ error?: { status?: number | null, message?: string } | null, onRetry: () => void,
 *   title?: string, description?: string, retryLabel?: string }} props
 */
const ErrorState = ({ error, onRetry, title, description, retryLabel }) => {
  const { t } = useTranslation("errorState");
  const offline = !title && error?.status == null;
  const Icon = offline ? WifiOff : AlertTriangle;

  return (
    <div className={styles.container} role="alert">
      <Icon size={40} className={styles.icon} aria-hidden="true" />
      <p className={styles.title}>
        {title ?? (offline ? t("connection.title") : t("generic.title"))}
      </p>
      <p className={styles.description}>
        {description ?? (offline ? t("connection.description") : errorMessage(t, error))}
      </p>
      <Button variant="primary" onClick={onRetry}>
        {retryLabel ?? t("retry")}
      </Button>
    </div>
  );
};

export default ErrorState;
