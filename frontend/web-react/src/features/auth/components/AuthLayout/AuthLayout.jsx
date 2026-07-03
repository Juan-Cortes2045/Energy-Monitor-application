import logoProyecto from "../../../../assets/logo_proyecto.png";
import styles from "./AuthLayout.module.css";
import BackButton from "../BackButton/BackButton.jsx";
import { useTranslation } from "react-i18next";

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
          <circle
            cx="520"
            cy="350"
            r="180"
            fill="none"
            style={{ stroke: "var(--color-primary)" }}
            strokeWidth="1"
            opacity="0.20"
          />
          <circle
            cx="520"
            cy="350"
            r="260"
            fill="none"
            style={{ stroke: "var(--color-primary)" }}
            strokeWidth="1"
            opacity="0.14"
          />
          <circle
            cx="520"
            cy="350"
            r="350"
            fill="none"
            style={{ stroke: "var(--color-primary)" }}
            strokeWidth="1"
            opacity="0.09"
          />
          <circle
            cx="520"
            cy="350"
            r="450"
            fill="none"
            style={{ stroke: "var(--color-primary)" }}
            strokeWidth="1"
            opacity="0.05"
          />
          <circle
            cx="80"
            cy="-10"
            r="130"
            fill="none"
            style={{ stroke: "var(--color-secondary)" }}
            strokeWidth="1"
            opacity="0.12"
          />
          <circle
            cx="80"
            cy="-10"
            r="85"
            fill="none"
            style={{ stroke: "var(--color-secondary)" }}
            strokeWidth="1"
            opacity="0.08"
          />
        </svg>

        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.brandBackdrop}>
            <img src={logoProyecto} alt="" aria-hidden="true" />
            <span className={styles.brandName}>EnergyMonitor</span>
          </div>
        </div>

        {/* Headline */}
        <div className={styles.leftMiddle}>
          <h1 className={styles.headline}>
            <span className={styles.headlineMain}>
              {t("headline.line1")}
              <br />
              {t("headline.line2")}
              <br />
            </span>
            <span className={styles.accentText}>{t("headline.line3")}</span>
          </h1>

          {/* Subtexto */}
          <p className={styles.subtext}>{t("subtext")}</p>

          {/* Pills */}
          <div className={styles.pills}>
            <span className={styles.pillBlue}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              {t("pills.realtime")}
            </span>

            <span className={styles.pillGreen}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {t("pills.alerts")}
            </span>

            <span className={styles.pillGhost}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              {t("pills.projects")}
            </span>
          </div>
        </div>

        {/* Copyright */}
        <p className={styles.copyright}>{t("copyright")}</p>
      </div>

      {/* PANEL DERECHO */}
      <div className={styles.right}>
        <div className={styles.backWrapper}>
          <BackButton />
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
