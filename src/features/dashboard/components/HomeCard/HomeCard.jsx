import { useState } from "react";
import { Heart } from "lucide-react";
import Card from "../../../../design/components/Card/Card";
import styles from "./HomeCard.module.css";
import { useTranslation } from "react-i18next";

const DESCRIPTION_LIMIT = 150;

const HomeCard = ({ home, onClick, onToggleFavorite }) => {
  const { t } = useTranslation("homeCard");
  const favorite = Boolean(home.favorite);
  const [expanded, setExpanded] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  // Los miembros usaban --color-secondary (verde claro): el texto blanco no llegaba al contraste mínimo.
  const headerColor = home.color
    ? home.color
    : home.role === "MEMBER"
      ? "var(--color-primary-dark)"
      : "var(--color-primary)";
  // Texto de la cabecera: sobre el primario del tema su color de contraste (oscuro en los temas
  // oscuros); sobre primary-dark o un color propio del hogar, blanco.
  const headerTextColor =
    !home.color && home.role !== "MEMBER" ? "var(--color-on-primary)" : "#ffffff";

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    setTogglingFavorite(true);
    try {
      await onToggleFavorite?.(home.idHome, !favorite);
    } finally {
      setTogglingFavorite(false);
    }
  };

  const description = home.description || home.descripcion || "";
  const isLong = description.length > DESCRIPTION_LIMIT;
  const displayText =
    expanded || !isLong
      ? description
      : description.slice(0, DESCRIPTION_LIMIT) + "…";

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleOpen = (e) => {
    e.stopPropagation();
    onClick?.();
  };

  // Toda la tarjeta responde al clic; con teclado y lector de pantalla se abre con el botón
  // del título (un role="button" con botones dentro no es accesible).
  return (
    <div className={styles.container} onClick={onClick}>
      <div
        className={styles.cardHeader}
        style={{ backgroundColor: headerColor, "--card-fg": headerTextColor }}
      >
        <div className={styles.headerText}>
          <h3 className={styles.title}>
            <button
              type="button"
              className={styles.openButton}
              onClick={handleOpen}
              aria-label={t("openHome", { name: home.name })}
            >
              {home.name}
            </button>
          </h3>
          <p className={styles.responsible}>{home.role === "MEMBER" ? t("member") : t("owner")}</p>
        </div>

        <button
          type="button"
          className={`${styles.favoriteButton} ${favorite ? styles.favorited : ""}`}
          onClick={toggleFavorite}
          disabled={togglingFavorite}
          aria-label={favorite ? t("removeFavorite") : t("addFavorite")}
          aria-busy={togglingFavorite}
        >
          <Heart size={18} />
        </button>
      </div>

      <Card>
        <div className={styles.body}>
          <p>
            <strong>{t("address")}: </strong>
            {home.address || home.addres}
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
                aria-expanded={expanded}
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
