import { AlertTriangle, X } from "lucide-react";
import Button from "../../../design/components/Button/Button";
import styles from "./ConfirmModal.module.css";

// Generic destructive-action confirmation, reused wherever the app used to
// call window.confirm() (deleting/leaving a home, unlinking a device) — see
// Fase 6: no new alert()/window.confirm(), reuse one shared modal instead.
const ConfirmModal = ({ title, message, confirmLabel, cancelLabel, onCancel, onConfirm, disabled = false }) => {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label={cancelLabel}>
          <X size={16} />
        </button>

        <div className={styles.iconWrap}>
          <AlertTriangle size={22} />
        </div>

        <p id="confirm-modal-title" className={styles.title}>
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
