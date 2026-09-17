import styles from "./Favorites.module.css";
import Header from "../../design/components/Header/Header";
import HomeCard from "../dashboard/components/HomeCard/HomeCard";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHomes } from "../../context/HomeContext";
import { setFavorite } from "../../services/home.service";
import LoadingState from "../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../components/shared/ErrorState/ErrorState";

const Favorites = () => {
  const { t } = useTranslation("favorites");
  const { homes, loading, error, refetch } = useHomes();
  const navigate = useNavigate();
  const breadcrumbItems = [
    { label: t("favorites.breadcrumb.home"), path: "/dashboard" },
    { label: t("favorites.breadcrumb.current") },
  ];

  const favoriteHomes = homes.filter((h) => h.favorite);

  const handleToggleFavorite = async (home, nextFavorite) => {
    await setFavorite(home.id, nextFavorite);
    await refetch();
  };

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <Header breadcrumbItems={breadcrumbItems} />

        <div className={styles.hero}>
          <h1 className={styles.title}>{t("favorites.title")}</h1>
          <p className={styles.subtitle}>{t("favorites.subtitle")}</p>
        </div>

        <div className={styles.gridBox}>
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : favoriteHomes.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={40} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>{t("favorites.empty.title")}</p>
              <p className={styles.emptyDesc}>
                {t("favorites.empty.description")}
              </p>
            </div>
          ) : (
            <div className={styles.grid}>
              {favoriteHomes.map((home) => (
                <HomeCard
                  key={home.id}
                  home={home}
                  onClick={() => navigate(`/homes/${home.id}`)}
                  onToggleFavorite={handleToggleFavorite}
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
