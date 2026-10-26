import { useDialogA11y } from "../../../hooks/useDialogA11y";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

/**
 * Componente modal base reutilizable con soporte completo de accesibilidad (Escape, foco, ARIA).
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  ariaLabelledBy,
  ariaDescribedBy,
  children,
  className = "",
  maxWidth = "500px",
}) => {
  const dialogRef = useDialogA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={`${styles.container} ${className}`}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
