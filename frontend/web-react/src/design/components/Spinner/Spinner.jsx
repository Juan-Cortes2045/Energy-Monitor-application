import styles from "../../css/Spinner.module.css";
import colors from "../../tokens/colors";

const Spinner = ({ size = "medium", variant = "primary" }) => {
  return (
    <span
      className={`${styles.spinner} ${styles[size]}`}
      style={{
        borderTopColor: colors[variant] || colors.primary,
      }}
    />
  );
};

export default Spinner;
