import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.css";

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
    >
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
