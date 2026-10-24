import styles from "../../css/Button.module.css";

/**
 * Botón del sistema de diseño. Los demás atributos (aria-label, aria-busy, form...) llegan
 * al <button>. icon es la URL de una imagen decorativa: el texto del botón ya lo nombra.
 */
const Button = ({
  className = "",
  children,
  type = "button",
  icon,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  style = {},
  ...rest
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
      {...rest}
    >
      {icon && <img src={icon} alt="" className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
