import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LogoProyecto from "../../../assets/logo_proyecto.webp";
import LegalModal from "../../../features/auth/components/LegalModal/LegalModal.jsx";
import styles from "./Footer.module.css";

/**
 * Pie de las páginas públicas (inicio, sobre nosotros, soporte): qué es EnergyMonitor, a
 * dónde ir y los documentos legales, que abren el mismo modal del registro.
 */
const Footer = () => {
  const { t } = useTranslation("footer");
  const [legalTab, setLegalTab] = useState(null); // null | "terms" | "privacy"

  return (
    <footer className={styles.footer}>
      {/* Arcos del panel de cuenta: el dial del medidor, tenue y a la derecha */}
      <svg className={styles.arcs} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
        <circle cx="400" cy="400" r="140" />
        <circle cx="400" cy="400" r="210" />
        <circle cx="400" cy="400" r="290" />
        <circle cx="400" cy="400" r="380" />
      </svg>

      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/home" className={styles.brandLink}>
            <img src={LogoProyecto} alt="" width="40" height="40" />
            <span className={styles.brandName}>EnergyMonitor</span>
          </Link>
          <p className={styles.tagline}>{t("tagline")}</p>
        </div>

        <nav className={styles.groups} aria-label={t("navLabel")}>
          <div className={styles.group}>
            <h2 className={styles.groupTitle}>{t("explore.title")}</h2>
            <ul className={styles.links}>
              <li><Link to="/home">{t("explore.home")}</Link></li>
              <li><Link to="/home#HowItWorks">{t("explore.howItWorks")}</Link></li>
              <li><Link to="/about">{t("explore.about")}</Link></li>
              <li><Link to="/support">{t("explore.support")}</Link></li>
            </ul>
          </div>

          <div className={styles.group}>
            <h2 className={styles.groupTitle}>{t("account.title")}</h2>
            <ul className={styles.links}>
              <li><Link to="/login">{t("account.login")}</Link></li>
              <li><Link to="/register">{t("account.register")}</Link></li>
            </ul>
          </div>

          <div className={styles.group}>
            <h2 className={styles.groupTitle}>{t("legal.title")}</h2>
            <ul className={styles.links}>
              <li>
                <button type="button" className={styles.linkButton} onClick={() => setLegalTab("terms")}>
                  {t("legal.terms")}
                </button>
              </li>
              <li>
                <button type="button" className={styles.linkButton} onClick={() => setLegalTab("privacy")}>
                  {t("legal.privacy")}
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.bottom}>
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <p>{t("project")}</p>
        </div>
      </div>

      <LegalModal
        isOpen={legalTab !== null}
        activeTab={legalTab ?? "terms"}
        onTabChange={setLegalTab}
        onClose={() => setLegalTab(null)}
      />
    </footer>
  );
};

export default Footer;
