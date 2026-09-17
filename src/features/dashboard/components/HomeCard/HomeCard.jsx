import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "./HomeCard.module.css";
import { useTranslation } from "react-i18next";

const DESCRIPTION_LIMIT = 150;

const HomeCard = ({ home, onClick, onToggleFavorite }) => {
  const { t } = useTranslation("homeCard");
  const [expanded, setExpanded] = useState(false);

  const headerColor = home.role === "MEMBER" ? "var(--color-secondary)" : "var(--color-primary)";
  const ownerName = home.owner ? `${home.owner.name} ${home.owner.last_name}`.trim() : "";

  const toggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite?.(home, !home.favorite);
  };

  const description = home.description || "";
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayText =
    expanded || !isLong
      ? description
      : description.slice(0, DESCRIPTION_LIMIT) + "…";

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={styles.container}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      aria-label={t("openHome", { name: home.name })}
      style={{ cursor: "pointer" }}
    >
      <div
        className={styles.cardHeader}
        style={{ backgroundColor: headerColor }}
      >
        <div className={styles.headerText}>
          <h3 className={styles.title}>{home.name}</h3>
          <p className={styles.responsible}>{ownerName}</p>
        </div>

        <button
          type="button"
          className={`${styles.favoriteButton} ${home.favorite ? styles.favorited : ""}`}
          onClick={toggleFavorite}
          aria-label={home.favorite ? t("removeFavorite") : t("addFavorite")}
        >
          <Heart size={18} />
        </button>
      </div>

      <Card>
        <div className={styles.body}>
          <p>
            <strong>{t("address")}: </strong>
            {home.address}
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

export default HomeCard;
