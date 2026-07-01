import { BookOpen, Headphones, Sparkles, ExternalLink } from "lucide-react";

import Card from "../../../../design/components/Card/Card";

import styles from "./HelpCenter.module.css";
import { useTranslation } from "react-i18next";

const HelpCenter = () => {
  const { t } = useTranslation("settings");

  const ITEMS = [
    {
      title: t("help.docs.title"),
      description: t("help.docs.description"),
      action: t("help.docs.action"),
      icon: <BookOpen size={20} />,
      type: "docs",
    },
    {
      title: t("help.support.title"),
      description: t("help.support.description"),
      action: t("help.support.action"),
      icon: <Headphones size={20} />,
      type: "support",
    },
    {
      title: t("help.updates.title"),
      description: t("help.updates.description"),
      action: t("help.updates.action"),
      icon: <Sparkles size={20} />,
      type: "updates",
    },
  ];
  return (
    <Card
      maxWidth="100%"
      style={{
        width: "calc(100% - 32px)",
        margin: "0 16px 20px 16px",
      }}
    >
      <div className={styles.container}>
        {ITEMS.map((item) => (
          <div key={item.title} className={styles.helpCard}>
            <div
              className={`${styles.icon}
              ${styles[item.type]}`}
            >
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <button className={styles.link}>
              {item.action}
              <ExternalLink size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default HelpCenter;
