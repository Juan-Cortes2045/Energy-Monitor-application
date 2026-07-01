import styles from "./Benefits.module.css";

import Card from "../../../../design/components/Card/Card";
import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import { useTranslation } from "react-i18next";

import { TrendingDown, BellRing, Leaf, ShieldCheck } from "lucide-react";

const Benefits = () => {
  const { t } = useTranslation("benefits");

  const benefits = [
    {
      title: t("items.item1.title"),
      description: t("items.item1.description"),
      icon: <TrendingDown size={36} />,
    },
    {
      title: t("items.item2.title"),
      description: t("items.item2.description"),
      icon: <BellRing size={36} />,
    },
    {
      title: t("items.item3.title"),
      description: t("items.item3.description"),
      icon: <Leaf size={36} />,
    },
    {
      title: t("items.item4.title"),
      description: t("items.item4.description"),
      icon: <ShieldCheck size={36} />,
    },
  ];

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
          {t("title")}
        </h2>

        <p
          style={{
            color: colors.textSecondary,
            marginTop: spacing.md,
          }}
        >
          {t("subtitle")}
        </p>
      </div>

      {/* BENEFICIOS */}
      <div className={styles.grid}>
        {benefits.map((benefit, index) => (
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
                className={styles.cardContent}
                style={{
                  fontFamily: typography.fontSecondary,
                  fontSize: typography.sizes.sm,
                }}
              >
                <div
                  className={styles.icon}
                  style={{ color: colors.secondary }}
                >
                  {benefit.icon}
                </div>

                <h4>{benefit.title}</h4>
                <p>{benefit.description}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
