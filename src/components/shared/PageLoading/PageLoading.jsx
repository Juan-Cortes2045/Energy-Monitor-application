import { useTranslation } from "react-i18next";
import styles from "./PageLoading.module.css";

/** Estado de carga de una pantalla (rutas diferidas, permisos que aún no llegan). */
const PageLoading = () => {
  const { t } = useTranslation("common");
  return (
    <p className={styles.loading} role="status">
      {t("loading")}
    </p>
  );
};

export default PageLoading;
