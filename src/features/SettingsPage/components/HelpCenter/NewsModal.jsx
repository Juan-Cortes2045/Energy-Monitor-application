import { useTranslation } from "react-i18next";

import HelpModal from "./HelpModal";
import { groupByDate } from "./groupByDate";
import styles from "./NewsModal.module.css";

// Los inyecta vite.config.js en cada build; en pruebas o sin git pueden faltar.
/* global __APP_VERSION__, __BUILD_DATE__, __COMMIT__, __CHANGELOG__ */
const VERSION = typeof __APP_VERSION__ === "undefined" ? "" : __APP_VERSION__;
const BUILD_DATE = typeof __BUILD_DATE__ === "undefined" ? "" : __BUILD_DATE__;
const COMMIT = typeof __COMMIT__ === "undefined" ? "" : __COMMIT__;
const CHANGELOG = typeof __CHANGELOG__ === "undefined" ? [] : __CHANGELOG__;

const TYPES = { feat: "new", perf: "improvement", fix: "fix" };

/** "2026-10-28" -> la fecha en el idioma activo. */
const formatDate = (iso, language) => {
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(language, { year: "numeric", month: "long", day: "numeric" });
};

/**
 * Novedades de la web: se generan solas en cada despliegue con los cambios (feat, fix y perf)
 * del repositorio. Muestra la versión y el commit que está en línea.
 */
const NewsModal = ({ onClose, entries = CHANGELOG, version = VERSION, buildDate = BUILD_DATE, commit = COMMIT }) => {
  const { t, i18n } = useTranslation("news");
  const { t: ts } = useTranslation("settings");
  const groups = groupByDate(entries);

  return (
    <HelpModal title={t("title")} closeLabel={ts("help.close")} onClose={onClose}>
      <p className={styles.subtitle}>{t("subtitle")}</p>
      <p className={styles.current}>
        {t("current", { version: version || "—", date: buildDate ? formatDate(buildDate, i18n.language) : "—" })}
        {commit && <span className={styles.commit}> · {commit}</span>}
      </p>

      {groups.length === 0 ? (
        <p className={styles.empty} role="status">
          {t("empty")}
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.date} className={styles.group} aria-label={formatDate(group.date, i18n.language)}>
            <h3 className={styles.date}>{formatDate(group.date, i18n.language)}</h3>
            <ul className={styles.list}>
              {group.items.map((entry) => (
                <li key={entry.hash} className={styles.item}>
                  <span className={`${styles.badge} ${styles[TYPES[entry.type]]}`}>{t(`types.${TYPES[entry.type]}`)}</span>
                  <span className={styles.text}>
                    {entry.scope && <strong>{entry.scope}: </strong>}
                    {entry.title}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
      <p className={styles.note}>{t("note")}</p>
    </HelpModal>
  );
};

export default NewsModal;
