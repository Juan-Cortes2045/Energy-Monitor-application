import { useId } from "react";
import { AlertTriangle, X } from "lucide-react";

import Button from "../../../design/components/Button/Button";
import styles from "./ConfirmModal.module.css";

// Recibe los textos ya traducidos: no usa i18n internamente.
const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  disabled = false,
}) => {
  const titleId = useId();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          aria-label={cancelLabel}
          disabled={disabled}
        >
          <X size={16} />
        </button>

        <div className={styles.iconWrap}>
          <AlertTriangle size={22} />
        </div>

        <p id={titleId} className={styles.title}>
          {title}
        </p>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </Button>
          <Button variant="Danger" onClick={onConfirm} disabled={disabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
