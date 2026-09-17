import { useTranslation } from "react-i18next";
import Button from "../../../design/components/Button/Button";
import styles from "./ErrorState.module.css";

// Generic "request failed" state with a retry button, used by every screen
// that fetches from the API (Fase 6). Not part of src/design/ — a plain
// feature-level component reusing the existing Button.
//
// Takes the normalized { status, code, message } error object (see
// src/services/api.js) rather than a raw string: `message` on that object
// is an untranslated, sometimes-English string coming straight from axios
// (e.g. "Could not reach the server"), so known codes are mapped to a
// translated string here instead of ever rendering it directly. Pass a
// pre-translated `message` string directly only for cases with no error
// object (e.g. a client-side validation message).
const ErrorState = ({ error, message, onRetry }) => {
  const { t } = useTranslation("common");
  const resolvedMessage =
    error?.code === "NETWORK_ERROR"
      ? t("error.offline")
      : error?.code === "FORBIDDEN"
        ? t("error.forbidden")
        : message || error?.message || t("error.generic");

  return (
    <div className={styles.container}>
      <p className={styles.message}>{resolvedMessage}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t("error.retry")}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
