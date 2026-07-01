import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "../ProjectCard/ProjectCard.module.css";
import { useTranslation } from "react-i18next";

const ProjectCard = ({ project, onClick }) => {
  const { t } = useTranslation("projectCard");
  const [favorite, setFavorite] = useState(project.favorite || false);

  const headerColor = project.color
    ? project.color
    : project.variant === "joined"
      ? "var(--color-secondary)"
      : "var(--color-primary)";

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setFavorite((prev) => !prev);
  };

  return (
    <div
      className={styles.container}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`Abrir proyecto ${project.name}`}
      style={{ cursor: "pointer" }}
    >
      <div
        className={styles.cardHeader}
        style={{ backgroundColor: headerColor }}
      >
        <div className={styles.headerText}>
          <h3 className={styles.title}>{project.name}</h3>
          <p className={styles.responsible}>{project.userResponsible}</p>
        </div>

        <button
          type="button"
          className={`${styles.favoriteButton} ${favorite ? styles.favorited : ""}`}
          onClick={toggleFavorite}
          aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
        >
          <Heart size={18} />
        </button>
      </div>

      <Card>
        <div className={styles.body}>
          <p>
            <strong>{t("address")}: </strong>
            {project.address || project.addres}
          </p>
          <p>
            <strong>{t("description")}: </strong>
            {project.description || project.descripcion}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectCard;