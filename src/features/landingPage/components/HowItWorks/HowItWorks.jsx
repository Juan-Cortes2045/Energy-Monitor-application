import styles from "../HowItWorks/HowItWorks.module.css";

import imgLp from "../../../../assets/img_lp2.png";
import { useTranslation } from "react-i18next";

import { User, Settings, BarChart3, AlertTriangle } from "lucide-react";

const HowItWorks = ({ id }) => {
  const { t } = useTranslation("howItWorks");
  const steps = [
    {
      number: 1,
      title: t("steps.step1.title"),
      description: t("steps.step1.description"),
      icon: <User size={18} />,
    },
    {
      number: 2,
      title: t("steps.step2.title"),
      description: t("steps.step2.description"),
      icon: <Settings size={18} />,
    },
    {
      number: 3,
      title: t("steps.step3.title"),
      description: t("steps.step3.description"),
      icon: <BarChart3 size={18} />,
    },
    {
      number: 4,
      title: t("steps.step4.title"),
      description: t("steps.step4.description"),
      icon: <AlertTriangle size={18} />,
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.header} id={id}>
        <h2 className={styles.title}>{t("title")}</h2>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>

      <div className={styles.body}>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <div className={styles.marker}>
                <div className={styles.number}>{step.number}</div>
              </div>

              <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  {step.title}
                </h4>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={styles.imageWrapper}>
          <img src={imgLp} alt={t("imageAlt")} className={styles.image} />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
