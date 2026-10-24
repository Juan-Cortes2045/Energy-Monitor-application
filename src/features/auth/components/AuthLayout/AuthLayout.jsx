import logoProyecto from "../../../../assets/logo_proyecto.webp";
import styles from "./AuthLayout.module.css";
import BackButton from "../BackButton/BackButton.jsx";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Activity, Bell, Folder, House } from "lucide-react";

const AuthLayout = ({ children }) => {
  const { t } = useTranslation("authLayout");

  return (
    <div className={styles.container}>

      {/* PANEL IZQUIERDO */}
      <div className={styles.left}>

        {/* Arcos decorativos */}
        <svg
          className={styles.decorSvg}
          viewBox="0 0 500 700"
          preserveAspectRatio="xMaxYMid meet"
          aria-hidden="true"
        >
          <circle cx="520" cy="350" r="180" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.20" />
          <circle cx="520" cy="350" r="260" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.14" />
          <circle cx="520" cy="350" r="350" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.09" />
          <circle cx="520" cy="350" r="450" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.05" />
          <circle cx="80" cy="-10" r="130" fill="none" style={{ stroke: "var(--color-secondary)" }} strokeWidth="1" opacity="0.12" />
          <circle cx="80" cy="-10" r="85" fill="none" style={{ stroke: "var(--color-secondary)" }} strokeWidth="1" opacity="0.08" />
        </svg>

        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.brandBackdrop}>
            <img src={logoProyecto} alt="" width="52" height="52" decoding="async" />
            <span className={styles.brandName}>EnergyMonitor</span>
          </div>
        </div>

        {/* Headline: el h1 de la página es el título del formulario (este panel se oculta en móvil) */}
        <div className={styles.leftMiddle}>
          <p className={styles.headline}>
            <span className={styles.headlineMain}>
              {t("headline.line1")}<br />
              {t("headline.line2")}<br />
            </span>
            <span className={styles.accentText}>
              {t("headline.line3")}
            </span>
          </p>

          {/* Subtexto */}
          <p className={styles.subtext}>
            {t("subtext")}
          </p>

          {/* Pills */}
          <div className={styles.pills}>
            <span className={styles.pillBlue}>
              <Activity size={12} />
              {t("pills.realtime")}
            </span>

            <span className={styles.pillGreen}>
              <Bell size={12} />
              {t("pills.alerts")}
            </span>

            <span className={styles.pillGhost}>
              <Folder size={12} />
              {t("pills.projects")}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <p className={styles.copyright}>
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>

      {/* PANEL DERECHO */}
      <main className={styles.right}>
        <div className={styles.backWrapper}>
          <BackButton />
        </div>
        {/* Acceso directo a la página de inicio pública desde cualquier pantalla de cuenta */}
        <Link to="/home" className={styles.homeLink}>
          <House size={18} aria-hidden="true" />
          <span>{t("home")}</span>
        </Link>
        {children}
      </main>

    </div>
  );
};

export default AuthLayout;