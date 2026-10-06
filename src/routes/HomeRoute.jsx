import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";

import { useHomes } from "../context/useHomes";
import Button from "../design/components/Button/Button";
import styles from "./HomeRoute.module.css";

const HomeNotFound = () => {
  const { t } = useTranslation("homeNotFound");
  const navigate = useNavigate();

  return (
    <div className={styles.notFound}>
      <Home size={40} className={styles.icon} />
      <h1 className={styles.title}>{t("title")}</h1>
      <p className={styles.description}>{t("description")}</p>
      <Button variant="primary" onClick={() => navigate("/dashboard")}>
        {t("backToDashboard")}
      </Button>
    </div>
  );
};

const HomeRoute = () => {
  const { t } = useTranslation("homeNotFound");
  const { homeId } = useParams();
  const { homes, loading, error, reload } = useHomes();

  // useParams devuelve string; los idHome del backend también: se comparan tal cual.
  const home = homes.find((h) => String(h.idHome) === String(homeId));

  if (loading) return <p className={styles.loading} role="status">{t("loading")}</p>;
  if (error)
    return (
      <div className={styles.notFound} role="alert">
        <p>{error.message}</p>
        <Button variant="primary" onClick={reload}>{t("retry")}</Button>
      </div>
    );
  if (!home) return <HomeNotFound />;

  return <Outlet context={{ home, isOwner: home.role === "OWNER" }} />;
};

export default HomeRoute;
