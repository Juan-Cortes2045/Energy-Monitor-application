import styles from "../EmptyState/EmptyState.module.css";
import emptyImg from "../../../../assets/empty_image.png";

import Button from "../../../../design/components/Button/Button";
import { useTranslation } from "react-i18next";

const EmptyState = ({ onCreateHome, onJoinHome }) => {
  const { t } = useTranslation("emptyState");
  return (
    <div className={styles.container}>
      <img className={styles.emptyImg} src={emptyImg} alt="empty" />

      <h2
        style={{
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-secondary)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--font-size-xl)",
        }}
      >
        {t("title")}
      </h2>

      <div className={styles.buttonsContainer}>
        <Button variant="secondary" onClick={onCreateHome}>
          {t("createHome")}
        </Button>
        <Button variant="primary" onClick={onJoinHome}>
          {t("joinHome")}
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;
