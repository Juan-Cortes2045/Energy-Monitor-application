import {
  BookOpen,
  Headphones,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import Card from "../../../../design/components/Card/Card";

import styles from "./HelpCenter.module.css";

const ITEMS = [
  {
    title: "Documentación",
    description:
      "Guías de uso, referencia de funciones y tutoriales paso a paso",
    action: "Abrir documentación",
    icon: <BookOpen size={20} />,
    type: "docs",
  },
  {
    title: "Soporte técnico",
    description:
      "Comunícate con el equipo de soporte para resolver incidencias",
    action: "Crear ticket",
    icon: <Headphones size={20} />,
    type: "support",
  },
  {
    title: "Novedades",
    description:
      "Últimas actualizaciones, mejoras y correcciones del sistema",
    action: "Ver registro de cambios",
    icon: <Sparkles size={20} />,
    type: "updates",
  },
];

const HelpCenter = () => {
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
          <div
            key={item.title}
            className={styles.helpCard}
          >
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