import { useState } from "react";
import { BookOpen, Headphones, Sparkles, ArrowRight } from "lucide-react";

import Card from "../../../../design/components/Card/Card";
import { usePermissions } from "../../../../services/auth/usePermissions";
import DocsModal from "./DocsModal";
import NewsModal from "./NewsModal";
import SupportModal from "./SupportModal";

import styles from "./HelpCenter.module.css";
import { useTranslation } from "react-i18next";

const MODALS = { docs: DocsModal, support: SupportModal, updates: NewsModal };

/**
 * Ayuda de Ajustes: cada tarjeta abre su modal (documentación, soporte y novedades). El soporte
 * solo es para usuarios: los administradores son quienes lo atienden, así que no lo ven.
 */
const HelpCenter = () => {
  const { t } = useTranslation("settings");
  const { isAdmin } = usePermissions();
  const [open, setOpen] = useState(null);

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
  ].filter((item) => !(isAdmin && item.type === "support"));

  const Modal = open ? MODALS[open] : null;

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
          <div key={item.type} className={styles.helpCard}>
            <div
              className={`${styles.icon}
              ${styles[item.type]}`}
            >
              {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <button type="button" className={styles.link} onClick={() => setOpen(item.type)}>
              {item.action}
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>
      {Modal && <Modal onClose={() => setOpen(null)} />}
    </Card>
  );
};

export default HelpCenter;
