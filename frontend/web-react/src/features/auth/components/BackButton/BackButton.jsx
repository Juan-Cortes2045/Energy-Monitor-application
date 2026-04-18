import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";
import colors from "../../../../design/tokens/colors";

const BackButton = ({ to, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${styles.backButton} ${className || ""}`}
      style={{
        color: colors.textPrimary,
      }}
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
