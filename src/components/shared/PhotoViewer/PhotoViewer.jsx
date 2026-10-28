import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { useDialogA11y } from "../../../hooks/useDialogA11y";
import { safeImage } from "./safeImage";
import styles from "./PhotoViewer.module.css";

/**
 * Foto ampliada sobre la propia página, sin abrir otra pestaña (la CSP de la app no permite
 * pedir `data:` con fetch, y una pestaña nueva tampoco los abre).
 * Recibe los textos ya traducidos. Se cierra con Escape, con el botón o al hacer clic fuera.
 */
const PhotoViewer = ({ src, alt, closeLabel, onClose }) => {
  const dialogRef = useDialogA11y(onClose);
  const image = safeImage(src);
  if (!image) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-label={alt} tabIndex={-1}>
        <button type="button" className={styles.close} onClick={onClose} aria-label={closeLabel}>
          <X size={22} />
        </button>
        <img src={image} alt={alt} className={styles.image} />
      </div>
    </div>,
    document.body,
  );
};

export default PhotoViewer;
