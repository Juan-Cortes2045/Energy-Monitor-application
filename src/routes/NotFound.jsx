import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";

import Button from "../design/components/Button/Button";
import { isAuthenticated, landingPath } from "../services/auth/session";
import styles from "./HomeRoute.module.css";

/** Ruta comodín (404): cualquier dirección que no existe en la app. */
const NotFound = () => {
  const { t } = useTranslation("errorState");
  const navigate = useNavigate();

  return (
    <main className={styles.notFound}>
      <SearchX size={40} className={styles.icon} aria-hidden="true" />
      <h1 className={styles.title}>{t("notFound.title")}</h1>
      <p className={styles.description}>{t("notFound.description")}</p>
      <Button
        variant="primary"
        onClick={() => navigate(isAuthenticated() ? landingPath() : "/home", { replace: true })}
      >
        {t("notFound.back")}
      </Button>
    </main>
  );
};

export default NotFound;
