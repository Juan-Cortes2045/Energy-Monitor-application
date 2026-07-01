import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "../ProjectCard/ProjectCard.module.css";
import { useTranslation } from "react-i18next";

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import radius from "../../../../design/tokens/radius";
import shadows from "../../../../design/tokens/shadows";

// ─── onClick viene de DashboardPage → setSelectedProject(project) ─────────────
const ProjectCard = ({ project, onClick }) => {
  const { t } = useTranslation("projectCard");
  const [favorite, setFavorite] = useState(project.favorite || false);

  const headerColor = project.color
    ? project.color
    : project.variant === "joined"
      ? colors.secondary
      : colors.primary;

  const toggleFavorite = (e) => {
    e.stopPropagation(); // evita disparar onClick de la card al tocar favorito
    setFavorite((prev) => !prev);
  };

  return (
    <div
      className={styles.container}
      onClick={onClick} // ← conexión del prop
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={`t("openProject") ${project.name}`}
      style={{
        "--pc-spacing": spacing.md,
        "--pc-radius": radius.lg,
        "--pc-shadow": shadows.md,
        "--pc-primary": colors.primary,
        "--pc-secondary": colors.secondary,
        "--pc-text": colors.textPrimary,
        "--pc-muted": colors.textSecondary,
        cursor: "pointer",
      }}
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
