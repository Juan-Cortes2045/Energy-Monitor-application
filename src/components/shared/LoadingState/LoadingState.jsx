import { useTranslation } from "react-i18next";
import styles from "./LoadingState.module.css";

// Shared "fetching data" placeholder for screens backed by the API
// (Fase 6). Not part of src/design/.
const LoadingState = () => {
  const { t } = useTranslation("common");
  return <div className={styles.container}>{t("loading")}</div>;
};

export default LoadingState;
