import styles from "../Hero/Hero.module.css";

import { useNavigate } from "react-router-dom";
import Button from "../../../../design/components/Button/Button";
import heroImg from "../../../../assets/hero_img.jpeg";

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import radius from "../../../../design/tokens/radius";
import shadows from "../../../../design/tokens/shadows";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.heroWrapper}>
      <section className={styles.container}>
        <div className={`${styles.left} ${styles.fadeUp}`}>
          <h1
            className={styles.title}
            style={{
              fontWeight: typography.weights.bold,
              fontFamily: typography.fontPrimary,
              lineHeight: "1.15",
            }}
          >
            <span className={styles.titleMain}>
              Controla tu
            </span>{" "}

            <span style={{ color: colors.secondary }}>
              consumo eléctrico
            </span>{" "}

            <span style={{ color: colors.primary }}>
              en tiempo real
            </span>
          </h1>

          <p
            className={styles.description}
            style={{
              marginTop: spacing.md,
              fontSize: typography.sizes.lg,
              fontWeight: typography.weights.bold,
              maxWidth: "450px",
            }}
          >
            Reduce costos, evita desperdicios y toma decisiones inteligentes
            desde tu hogar.
          </p>

          <div
            className={styles.buttonWrapper}
            style={{ marginTop: spacing.md }}
          >
            <Button
              variant="primary"
              onClick={() => navigate("/login")}
            >
              Comenzar ahora
            </Button>
          </div>

          <div
            className={styles.features}
            style={{
              marginTop: spacing.md,
              fontSize: typography.sizes.md,
              fontWeight: typography.weights.medium,
            }}
          >
            <span>Sin costos iniciales ✔️</span>
            <span>Fácil de usar ⚡</span>
            <span>Datos en tiempo real 📊</span>
          </div>
        </div>

        <div className={`${styles.right} ${styles.fadeUpDelay}`}>
          <img
            src={heroImg}
            alt="Panel de monitoreo del consumo eléctrico"
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