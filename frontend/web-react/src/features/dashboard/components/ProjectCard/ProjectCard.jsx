import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "../ProjectCard/ProjectCard.module.css";

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import radius from "../../../../design/tokens/radius";
import shadows from "../../../../design/tokens/shadows";

const ProjectCard = ({ project }) => {
  const [favorite, setFavorite] = useState(project.favorite || false);

  const headerColor = project.color
    ? project.color
    : project.variant === "joined"
    ? colors.secondary
    : colors.primary;

  const toggleFavorite = () => {
    setFavorite((prev) => !prev);
  };

  return (
    <div
      className={styles.container}
      style={{
        "--pc-spacing": spacing.md,
        "--pc-radius": radius.lg,
        "--pc-shadow": shadows.md,
        "--pc-primary": colors.primary,
        "--pc-secondary": colors.secondary,
        "--pc-text": colors.textPrimary,
        "--pc-muted": colors.textSecondary,
      }}
    >
      <div className={styles.cardHeader} style={{ backgroundColor: headerColor }}>
        <div className={styles.headerText}>
          <h3 className={styles.title}>{project.name}</h3>
          <p className={styles.responsible}>{project.userResponsible}</p>
        </div>

        <button
          type="button"
          className={`${styles.favoriteButton} ${favorite ? styles.favorited : ""}`}
          onClick={toggleFavorite}
          aria-label={favorite ? "Quitar favorito" : "Añadir a favoritos"}
        >
          <Heart size={18} />
        </button>
      </div>

      <Card>
        <div className={styles.body}>
          <p>
            <strong>Dirección: </strong>
            {project.address || project.addres}
          </p>
          <p>
            <strong>Descripción: </strong>
            {project.description || project.descripcion}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectCard;