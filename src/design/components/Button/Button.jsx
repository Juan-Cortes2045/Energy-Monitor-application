import styles from "../../css/Button.module.css";

const Button = ({
  className = {},
  children,
  type = "button",
  icon,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  style = {},
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.button}
        ${styles[size]}
        ${styles[variant]}
        ${disabled ? styles.disabled : ""}
        ${className}
      `}
      style={style}
    >
      {icon && <img src={icon} alt="icon" className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;