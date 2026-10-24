import styles from "../EmptyState/EmptyState.module.css";
import emptyImg from "../../../../assets/empty_image.webp";

import Button from "../../../../design/components/Button/Button";
import { useTranslation } from "react-i18next";

const EmptyState = ({ onCreateHome, onJoinHome }) => {
  const { t } = useTranslation("emptyState");
  return (
    <div className={styles.container}>
      {/* Ilustración decorativa: el título ya describe el estado. */}
      <img
        className={styles.emptyImg}
        src={emptyImg}
        alt=""
        width={486}
        height={214}
        decoding="async"
      />

      <h2 className={styles.title}>{t("title")}</h2>

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
