import { useTranslation } from "react-i18next";

import { usePermissions } from "../../../../services/auth/usePermissions";
import HelpModal from "./HelpModal";
import styles from "./DocsModal.module.css";

/**
 * Documentación según quién la lee: una cuenta de administración ve solo la de la administración
 * y una de usuario, solo la de usuario. El contenido sale de i18n (`docs:user` y `docs:admin`).
 */
const DocsModal = ({ onClose }) => {
  const { t } = useTranslation("docs");
  const { t: ts } = useTranslation("settings");
  const { isAdmin } = usePermissions();
  const role = isAdmin ? "admin" : "user";
  const sections = t(role, { returnObjects: true });
  const list = Array.isArray(sections) ? sections : [];

  return (
    <HelpModal title={t("title")} closeLabel={ts("help.close")} onClose={onClose}>
      <p className={styles.subtitle}>{t(`subtitle.${role}`)}</p>
      <div className={styles.list}>
        {list.map((section, i) => (
          <article key={section.title} className={styles.section}>
            <h3 className={styles.heading}>
              <span className={styles.number} aria-hidden="true">
                {i + 1}
              </span>
              {section.title}
            </h3>
            <p className={styles.body}>{section.body}</p>
          </article>
        ))}
      </div>
    </HelpModal>
  );
};

export default DocsModal;
