import styles from "./Benefits.module.css";
import Card from "../../../../design/components/Card/Card";
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
    <section className={styles.container}>
      {/* TÍTULO */}
      <div className={styles.header}>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      {/* BENEFICIOS */}
      <div className={styles.grid}>
        {benefits.map((benefit, index) => (
          <div key={index}>
            <Card style={{ maxWidth: "300px", margin: "0 auto", height: "100%", flexDirection: "column" }}>
              <div className={styles.cardContent}>
                <div className={styles.icon}>{benefit.icon}</div>
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