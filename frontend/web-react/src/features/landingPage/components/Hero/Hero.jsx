import styles from "../Hero/Hero.module.css";

import { useNavigate } from "react-router-dom";
import Button from "../../../../design/components/Button/Button";
import heroImg from "../../../../assets/hero_img.jpeg";
import { useTranslation } from "react-i18next";

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import radius from "../../../../design/tokens/radius";
import shadows from "../../../../design/tokens/shadows";

const Hero = () => {
  const { t } = useTranslation("hero");
  const navigate = useNavigate();
  return (
    <div className={styles.heroWrapper}>
      <section className={styles.container}>
        {/*IZQUIERDA*/}
        <div className={`${styles.left} ${styles.fadeUp}`}>
          <h1
            style={{
              fontWeight: typography.weights.bold,
              fontFamily: typography.fontPrimary,
              color: colors.textPrimary,
              lineHeight: "1.2",
            }}
          >
            {t("title.part1")}{" "}
            <span style={{ color: colors.secondary }}>
              {t("title.highlight1")}
            </span>{" "}
            <span style={{ color: colors.primary }}>
              {t("title.highlight2")}
            </span>
          </h1>

          <p
            style={{
              marginTop: spacing.md,
              color: colors.textSecondary,
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.bold,
              maxWidth: "450px",
            }}
          >
            {t("description")}
          </p>

          {/*BOTON*/}
          <div
            className={styles.buttonWrapper}
            style={{ marginTop: spacing.md }}
          >
            <Button variant="primary" onClick={() => navigate("/login")}>
              {t("cta")}
            </Button>
          </div>

          {/*FUNCIONALIDADES*/}
          <div
            className={styles.features}
            style={{
              marginTop: spacing.md,
              color: colors.textSecondary,
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.medium,
            }}
          >
            <span>{t("features.noCost")}</span>
            <span>{t("features.easy")}</span>
            <span>{t("features.realtime")}</span>
          </div>
        </div>

        {/*DERECHA*/}
        <div className={`${styles.right} ${styles.fadeUpDelay}`}>
          <img
            src={heroImg}
            alt="Energy System"
            style={{
              borderRadius: radius.md,
              boxShadow: shadows.lg,
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default Hero;
