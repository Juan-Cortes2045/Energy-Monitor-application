import { useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useDialogA11y } from "../../../../hooks/useDialogA11y";
import styles from "./HelpModal.module.css";

/**
 * Marco común de los modales de ayuda de Ajustes (documentación, soporte y novedades): título,
 * botón de cierre y contenido con desplazamiento. Escape, clic fuera o el botón lo cierran, el
 * foco queda dentro y vuelve al enlace que lo abrió. Recibe los textos ya traducidos.
 */
const HelpModal = ({ title, closeLabel, onClose, children }) => {
  const titleId = useId();
  const dialogRef = useDialogA11y(onClose);

  return createPortal(
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} className={styles.box} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
            <X size={20} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default HelpModal;
