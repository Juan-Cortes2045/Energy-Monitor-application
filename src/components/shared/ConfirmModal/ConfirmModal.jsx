import { useId } from "react";
import { AlertTriangle, X } from "lucide-react";

import Button from "../../../design/components/Button/Button";
import { useDialogA11y } from "../../../hooks/useDialogA11y";
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
  confirmDisabled = false,
  children,
}) => {
  const titleId = useId();
  const messageId = useId();

  // Foco en el diálogo al abrir y atrapado dentro; Escape cancela (salvo con la acción en curso)
  // y al cerrar el foco vuelve al botón que lo abrió.
  const dialogRef = useDialogA11y(() => {
    if (!disabled) onCancel?.();
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !disabled) onCancel?.();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCancel}
          aria-label={cancelLabel}
          disabled={disabled}
        >
          <X size={16} />
        </button>

        <div className={styles.iconWrap} aria-hidden="true">
          <AlertTriangle size={22} />
        </div>

        <p id={titleId} className={styles.title}>
          {title}
        </p>
        <p id={messageId} className={styles.message}>
          {message}
        </p>

        {/* Contenido extra, p. ej. un campo para confirmar escribiendo el nombre. */}
        {children}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={disabled}>
            {cancelLabel}
          </Button>
          <Button variant="Danger" onClick={onConfirm} disabled={disabled || confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
