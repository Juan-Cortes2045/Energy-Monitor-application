import styles from "../Hero/Hero.module.css";

import { useNavigate } from "react-router-dom";
import Button from "../../../../design/components/Button/Button";
import heroImg from "../../../../assets/hero_img.jpeg";
import { useTranslation } from "react-i18next";

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

          <p className={styles.description}>
            {t("description")}
          </p>

          {/* BOTÓN */}
          <div className={styles.buttonWrapper}>
            <Button variant="primary" onClick={() => navigate("/login")}>
              {t("cta")}
            </Button>
          </div>

          {/* FUNCIONALIDADES */}
          <div className={styles.features}>
            <span>{t("features.noCost")}</span>
            <span>{t("features.easy")}</span>
            <span>{t("features.realtime")}</span>
          </div>
        </div>

        {/* DERECHA */}
        <div className={`${styles.right} ${styles.fadeUpDelay}`}>
          <img
            src={heroImg}
            alt="Panel de monitoreo del consumo eléctrico"
            className={styles.heroImg}
          />
        </div>
      </section>
    </div>
  );
};

export default Hero;