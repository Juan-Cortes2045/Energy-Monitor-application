import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import Button from "../../../../design/components/Button/Button.jsx";
import styles from "./LegalModal.module.css";

const TABS = ["terms", "privacy"];
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Términos y política de privacidad. Con `onAccept` es además el paso de aceptación: muestra
 * "Cancelar" (onClose) y "Acepto" (onAccept), y es lo que se pide antes de crear o usar una
 * cuenta que nunca los aceptó.
 */
const LegalModal = ({ isOpen, activeTab = "terms", onTabChange, onClose, onAccept }) => {
  const { t } = useTranslation("legalModal");
  const cardRef = useRef(null);
  const closeRef = useRef(null);
  const tabRefs = useRef({});
  // onClose suele llegar como función nueva en cada render: se guarda en un ref para no
  // reinstalar el listener (y no robar el foco) en cada render del padre.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Al abrir: foco dentro del diálogo, Escape cierra, Tab no sale del diálogo y el
  // fondo no hace scroll. Al cerrar, el foco vuelve a quien abrió el modal.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const items = [...cardRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const doc = t(activeTab, { returnObjects: true });

  // Pestañas con flechas (patrón ARIA tabs): izquierda/derecha cambian de documento.
  const handleTabKeyDown = (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const step = e.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(TABS.indexOf(activeTab) + step + TABS.length) % TABS.length];
    onTabChange?.(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={cardRef}
        className={styles.card}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.tabs} role="tablist" aria-label={t("tablistLabel")}>
            {TABS.map((tab) => (
              <button
                key={tab}
                ref={(el) => (tabRefs.current[tab] = el)}
                type="button"
                role="tab"
                id={`legal-tab-${tab}`}
                aria-selected={activeTab === tab}
                aria-controls="legal-modal-panel"
                tabIndex={activeTab === tab ? 0 : -1}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => onTabChange?.(tab)}
                onKeyDown={handleTabKeyDown}
              >
                {t(`${tab}.tabLabel`)}
              </button>
            ))}
          </div>
          <button
            ref={closeRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body: key reinicia el scroll al cambiar de documento */}
        <div
          key={activeTab}
          id="legal-modal-panel"
          className={styles.body}
          role="tabpanel"
          aria-labelledby={`legal-tab-${activeTab}`}
          tabIndex={0}
        >
          <h2 id="legal-modal-title" className={styles.title}>{doc.title}</h2>
          <p className={styles.updated}>{doc.lastUpdated}</p>
          <p className={styles.intro}>{doc.intro}</p>

          {doc.sections?.map((section) => (
            <section key={section.heading} className={styles.section}>
              <h3 className={styles.sectionHeading}>{section.heading}</h3>
              {section.body.split("\n\n").map((paragraph, i) => (
                <p key={i} className={styles.paragraph}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <p className={styles.footer}>{doc.footer}</p>
        </div>

        {onAccept && (
          <div className={styles.consent}>
            <p className={styles.consentText}>{t("consent.text")}</p>
            <div className={styles.consentActions}>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t("consent.cancel")}
              </Button>
              <Button type="button" onClick={onAccept}>
                {t("consent.accept")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalModal;
