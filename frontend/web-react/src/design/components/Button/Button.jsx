import styles from "../../css/Button.module.css";
import colors from "../../tokens/colors";

const Button = ({
  children,
  type = "button",
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${disabled ? styles.disabled : ""}
      `}
      style={{
        backgroundColor: colors[variant] || colors.primary,
      }}
    >
      {children}
    </button>
  );
};

export default Button;
