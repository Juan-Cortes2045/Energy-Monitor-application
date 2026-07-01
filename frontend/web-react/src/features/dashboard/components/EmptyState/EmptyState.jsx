import styles from "../EmptyState/EmptyState.module.css";
import emptyImg from "../../../../assets/empty_image.png";

import Button from "../../../../design/components/Button/Button";
import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import { useTranslation } from "react-i18next";

const EmptyState = ({ onCreateProject, onJoinProject }) => {
  const { t } = useTranslation("emptyState");
  return (
    <div className={styles.container}>
      <img className={styles.emptyImg} src={emptyImg} alt="empty" />

      <h2
        style={{
          color: colors.textSecondary,
          fontFamily: typography.fontSecondary,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.xl,
        }}
      >
        {t("title")}
      </h2>

      <div className={styles.buttonsContainer}>
        <Button variant="secondary" onClick={onCreateProject}>
          {t("createProject")}
        </Button>
        <Button variant="primary" onClick={onJoinProject}>
          {t("joinProject")}
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;