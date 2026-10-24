import styles from "../Hero/Hero.module.css";

import { useNavigate } from "react-router-dom";
import Button from "../../../../design/components/Button/Button";
import heroImg from "../../../../assets/hero_img.webp";
import { useTranslation } from "react-i18next";
import { BadgeCheck, Zap, BarChart3 } from "lucide-react";

// Iconos de las funcionalidades (decorativos: el texto ya lo dice)
const FEATURES = [
  { key: "noCost", icon: <BadgeCheck size={18} /> },
  { key: "easy", icon: <Zap size={18} /> },
  { key: "realtime", icon: <BarChart3 size={18} /> },
];

const Hero = () => {
  const { t } = useTranslation("hero");
  const navigate = useNavigate();

  return (
    <div className={styles.heroWrapper}>
      <section className={styles.container}>
        {/* IZQUIERDA */}
        <div className={`${styles.left} ${styles.fadeUp}`}>
          <h1 className={styles.title}>
            {t("title.part1")}{" "}
            <span className={styles.highlightSecondary}>
              {t("title.highlight1")}
            </span>{" "}
            <span className={styles.highlightPrimary}>
              {t("title.highlight2")}
            </span>
          </h1>

          <p className={styles.description}>{t("description")}</p>

          {/* BOTÓN */}
          <div className={styles.buttonWrapper}>
            <Button variant="primary" onClick={() => navigate("/register")}>
              {t("cta")}
            </Button>
          </div>

          {/* FUNCIONALIDADES */}
          <ul className={styles.features}>
            {FEATURES.map(({ key, icon }) => (
              <li key={key} className={styles.feature}>
                <span className={styles.featureIcon}>{icon}</span>
                {t(`features.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        {/* DERECHA */}
        <div className={`${styles.right} ${styles.fadeUpDelay}`}>
          {/* Imagen principal (above the fold): dimensiones reales para no mover el layout */}
          <img
            src={heroImg}
            alt={t("imageAlt")}
            width="1536"
            height="1024"
            fetchPriority="high"
            decoding="async"
            className={styles.heroImg}
          />
        </div>
      </section>
    </div>
  );
};

export default Hero;
