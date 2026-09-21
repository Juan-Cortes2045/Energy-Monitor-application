import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";

import { useHomes } from "../context/HomeContext";
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
  const { homeId } = useParams();
  const { homes } = useHomes();

  // useParams devuelve string y los ids actuales son números: se normalizan
  // ambos lados a string.
  const home = homes.find((h) => String(h.id) === String(homeId));

  if (!home) return <HomeNotFound />;

  return <Outlet context={{ home, isOwner: home.variant === "owned" }} />;
};

export default HomeRoute;
