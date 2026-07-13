import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "../ProjectCard/ProjectCard.module.css";
import { useTranslation } from "react-i18next";

const DESCRIPTION_LIMIT = 150; // caracteres antes de considerar "largo"

const ProjectCard = ({ project, onClick }) => {
  const { t } = useTranslation("projectCard");
  const [favorite, setFavorite] = useState(project.favorite || false);
  const [expanded, setExpanded] = useState(false);

  const headerColor = project.color
    ? project.color
    : project.variant === "joined"
      ? "var(--color-secondary)"
      : "var(--color-primary)";

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setFavorite((prev) => !prev);
  };

  // Obtener la descripción (soporta ambos nombres de campo)
  const description = project.description || project.descripcion || "";
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayText =
    expanded || !isLong
      ? description
      : description.slice(0, DESCRIPTION_LIMIT) + "…";

  const handleToggleExpand = (e) => {
    e.stopPropagation(); // no activa el onClick de la tarjeta
    setExpanded((prev) => !prev);
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
          <div className={styles.descriptionWrapper}>
            <p
              className={`${styles.description} ${!expanded && isLong ? styles.clamped : ""}`}
            >
              <strong>{t("description")}: </strong>
              {displayText}
            </p>
            {isLong && (
              <button
                type="button"
                className={styles.toggleButton}
                onClick={handleToggleExpand}
              >
                {expanded ? t("showLess") : t("showMore")}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectCard;