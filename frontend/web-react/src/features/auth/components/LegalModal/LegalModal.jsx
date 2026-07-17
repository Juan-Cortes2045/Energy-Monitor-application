import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import styles from "./LegalModal.module.css";

const LegalModal = ({ isOpen, activeTab = "terms", onTabChange, onClose }) => {
  const { t } = useTranslation("legalModal");

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const doc = t(activeTab, { returnObjects: true });

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={doc?.title}
    >
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "terms" ? styles.tabActive : ""
              }`}
              onClick={() => onTabChange?.("terms")}
            >
              {t("terms.tabLabel")}
            </button>
            <button
              type="button"
              className={`${styles.tab} ${
                activeTab === "privacy" ? styles.tabActive : ""
              }`}
              onClick={() => onTabChange?.("privacy")}
            >
              {t("privacy.tabLabel")}
            </button>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <h2 className={styles.title}>{doc.title}</h2>
          <p className={styles.updated}>{doc.lastUpdated}</p>
          <p className={styles.intro}>{doc.intro}</p>

          {doc.sections?.map((section, index) => (
            <section key={index} className={styles.section}>
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
      </div>
    </div>
  );
};

export default LegalModal;