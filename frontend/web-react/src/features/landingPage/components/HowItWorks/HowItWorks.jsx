import styles from "../HowItWorks/HowItWorks.module.css";

import Card from "../../../../design/components/Card/Card";
import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import imgLp from "../../../../assets/img_lp2.png";
import { useTranslation } from "react-i18next";

import {
  User,
  Settings,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Regístrate o inicia sesión",
    description:
      "Crea tu cuenta fácilmente o accede con tu cuenta de Google para comenzar a usar la plataforma de forma segura.",
    icon: <User size={42} />,
  },
  {
    number: 2,
    title: "Crea y configura tu proyecto",
    description:
      "Registra tu hogar, vincula dispositivos eléctricos y define límites de consumo personalizados.",
    icon: <Settings size={42} />,
  },
  {
    number: 3,
    title: "Visualiza y analiza",
    description:
      "Consulta tu consumo en tiempo real con gráficos claros y detallados.",
    icon: <BarChart3 size={42} />,
  },
  {
    number: 4,
    title: "Recibe alertas inteligentes",
    description:
      "Obtén notificaciones automáticas y recomendaciones para optimizar tu consumo energético.",
    icon: <AlertTriangle size={42} />,
  },
];

const HowItWorks = () => {
  const { t } = useTranslation("howItWorks");
  const steps = [
    {
      number: 1,
      title: t("steps.step1.title"),
      description: t("steps.step1.description"),
      icon: <User size={42} />,
    },
    {
      number: 2,
      title: t("steps.step2.title"),
      description: t("steps.step2.description"),
      icon: <Settings size={42} />,
    },
    {
      number: 3,
      title: t("steps.step3.title"),
      description: t("steps.step3.description"),
      icon: <BarChart3 size={42} />,
    },
    {
      number: 4,
      title: t("steps.step4.title"),
      description: t("steps.step4.description"),
      icon: <AlertTriangle size={42} />,
    },
  ];
  return (
    <section
      className={styles.container}
      style={{
        padding: spacing.xl,
      }}
    >
      <div className={styles.header}>
        <h2
          className={styles.title}
          style={{
            fontFamily: typography.fontPrimary,
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
          }}
        >
          {t("title")}
        </h2>

        <p
          className={styles.subtitle}
          style={{
            marginTop: spacing.sm,
          }}
        >
          {t("subtitle")}
        </p>
      </div>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={index}>
            <Card
              style={{
                maxWidth: "300px",
                margin: "0 auto",
                height: "100%",
                flexDirection: "column",
              }}
            >
              <div
                className={styles.stepContent}
                style={{
                  fontFamily: typography.fontSecondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                <div className={styles.stepHeader}>
                  <div className={styles.number}>{step.number}</div>

                  <h4>{step.title}</h4>
                </div>

                <p>{step.description}</p>

                <div
                  className={styles.icon}
                  style={{ color: colors.secondary }}
                >
                  {step.icon}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className={styles.imageWrapper}>
        <img src={imgLp} alt="Dashboard ilustración" className={styles.image} />
      </div>
    </section>
  );
};

export default HowItWorks;