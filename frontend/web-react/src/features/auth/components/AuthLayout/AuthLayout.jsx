import logoProyecto from "../../../../assets/logo_proyecto.png";
import styles from "./AuthLayout.module.css";
import BackButton from "../BackButton/BackButton.jsx";

const AuthLayout = ({ children }) => {
  return (
    <div className={styles.container}>

      {/* PANEL IZQUIERDO */}
      <div className={styles.left}>

        {/* Arcos decorativos */}
        <svg className={styles.decorSvg} viewBox="0 0 500 700" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
          <circle cx="520" cy="350" r="180" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.20" />
          <circle cx="520" cy="350" r="260" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.14" />
          <circle cx="520" cy="350" r="350" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.09" />
          <circle cx="520" cy="350" r="450" fill="none" style={{ stroke: "var(--color-primary)" }} strokeWidth="1" opacity="0.05" />
          <circle cx="80"  cy="-10" r="130" fill="none" style={{ stroke: "var(--color-secondary)" }} strokeWidth="1" opacity="0.12" />
          <circle cx="80"  cy="-10" r="85"  fill="none" style={{ stroke: "var(--color-secondary)" }} strokeWidth="1" opacity="0.08" />
        </svg>

        {/* Logo — ícono recortado + nombre de la app */}
        <div className={styles.brand}>
          <div className={styles.brandBackdrop}>
            <img src={logoProyecto} alt="" aria-hidden="true" />
            <span className={styles.brandName}>EnergyMonitor</span>
          </div>
        </div>

        {/* Headline + descripción + pills */}
        <div className={styles.leftMiddle}>
          <h1 className={styles.headline}>
            <span className={styles.headlineMain}>
              Monitorea tu<br />energía en<br />
            </span>
            <span className={styles.accentText}>tiempo real.</span>
          </h1>
          <p className={styles.subtext}>
            Controla el consumo energético de tus proyectos, configura alertas
            y toma decisiones basadas en datos precisos.
          </p>

          <div className={styles.pills}>
            <span className={styles.pillBlue}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Análisis en tiempo real
            </span>
            <span className={styles.pillGreen}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Alertas automáticas
            </span>
            <span className={styles.pillGhost}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Gestión por proyectos
            </span>
          </div>
        </div>

        {/* Copyright */}
        <p className={styles.copyright}>
          © 2025 EnergyMonitor. Todos los derechos reservados.
        </p>
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