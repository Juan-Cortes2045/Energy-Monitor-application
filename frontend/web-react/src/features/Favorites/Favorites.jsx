import styles from "./Favorites.module.css";
import Header from "../../design/components/Header/Header";
import ProjectCard from "../dashboard/components/ProjectCard/ProjectCard";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const Favorites = ({ projects = [], onToggleFavorite, onCardClick }) => {
  const { t } = useTranslation("favorites");
  const breadcrumbItems = [
    { label: t("favorites.breadcrumb.home"), path: "/dashboard" },
    { label: t("favorites.breadcrumb.current") },
  ];

  const favoriteProjects = projects.filter((p) => p.favorite);

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <Header breadcrumbItems={breadcrumbItems} />

        <div className={styles.hero}>
          <h1 className={styles.title}>{t("favorites.title")}</h1>
          <p className={styles.subtitle}>{t("favorites.subtitle")}</p>
        </div>

        <div className={styles.gridBox}>
          {favoriteProjects.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={40} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>{t("favorites.empty.title")}</p>
              <p className={styles.emptyDesc}>
                {t("favorites.empty.description")}
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