import styles from "../HowItWorks/HowItWorks.module.css";

import Card from "../../../../design/components/Card/Card"
import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import imgLp from "../../../../assets/img_lp2.png"

import { User, Settings, BarChart3, AlertTriangle } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Regístrate o inicia sesión",
    description:
      "Crea tu cuenta fácilmente o accede con redes sociales para comenzar a usar la plataforma.",
    icon: <User size={20} />,
  },
  {
    number: 2,
    title: "Crea y configura tu proyecto",
    description:
      "Registra tu hogar, vincula dispositivos eléctricos y define límites personalizados.",
    icon: <Settings size={20} />,
  },
  {
    number: 3,
    title: "Visualiza y analiza",
    description:
      "Consulta tu consumo en tiempo real con gráficos claros y detallados.",
    icon: <BarChart3 size={20} />,
  },
  {
    number: 4,
    title: "Recibe alertas inteligentes",
    description:
      "Obtén notificaciones y recomendaciones para optimizar tu consumo.",
    icon: <AlertTriangle size={20} />,
  },
];

const HowItWorks = () => {
  return (
    <section
      className={styles.container}
      style={{
        background: colors.background,
        padding: spacing.xl,
      }}
    >
      {/* TÍTULO */}
      <div className={styles.header}>
        <h2
          style={{
            fontFamily: typography.fontPrimary,
            fontSize: typography.sizes.xl,
            fontWeight: typography.weights.bold,
            color: colors.textPrimary,
          }}
        >
          ¿Cómo funciona EnergyMonitor?
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: spacing.sm,
          }}
        >
          Monitorea, analiza y optimiza tu consumo energético en pocos pasos.
        </p>
      </div>

      {/* PASOS */}
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={index} className={styles.stepWrapper}>
            <Card style={{ maxWidth: "300px" }}>
              <div className={styles.stepContent}>
                <div className={styles.stepHeader}>
                  <div className={styles.number}>{step.number}</div>
                  <h4>{step.title}</h4>
                </div>

                <p>{step.description}</p>

                <div className={styles.icon}>{step.icon}</div>
              </div>
            </Card>

            {/* FLECHA */}
            {index < steps.length - 1 && (
              <div className={styles.arrow}>→</div>
            )}
          </div>
        ))}
      </div>

      {/* IMAGEN */}
      <div className={styles.imageWrapper}>
        <img
          src={imgLp}
          alt="Dashboard ilustración"
          className={styles.image}
        />
      </div>
    </section>
  );
};

export default HowItWorks;
