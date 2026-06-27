import styles from "./Favorites.module.css";
import Header from "../../design/components/Header/Header";
import ProjectCard from "../dashboard/components/ProjectCard/ProjectCard";
import { Heart } from "lucide-react";

const Favorites = ({ projects = [], onToggleFavorite, onCardClick }) => {
  const breadcrumbItems = [
    { label: "Inicio", path: "/dashboard" },
    { label: "Favoritos" },
  ];

  const favoriteProjects = projects.filter((p) => p.favorite);

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <Header breadcrumbItems={breadcrumbItems} />

        <div className={styles.hero}>
          <h1 className={styles.title}>Favoritos</h1>
          <p className={styles.subtitle}>
            Tus proyectos marcados como favoritos aparecen aquí para que los
            encuentres de forma rápida.
          </p>
        </div>

        <div className={styles.gridBox}>
          {favoriteProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={40} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>Sin favoritos aún</p>
              <p className={styles.emptyDesc}>
                Marca el corazón en cualquier proyecto para verlo aquí.
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {favoriteProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => onCardClick?.(project)}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;