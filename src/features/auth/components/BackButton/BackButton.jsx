import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./BackButton.module.css";

const BackButton = ({ to, className }) => {
  const navigate = useNavigate();
  const { t } = useTranslation("authLayout");

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      // Entrada directa (enlace o pestaña nueva): no hay página anterior en la app.
      navigate("/home");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.backButton} ${className || ""}`}
      aria-label={t("back")}
      title={t("back")}
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
