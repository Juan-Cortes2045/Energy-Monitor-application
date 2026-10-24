import styles from "../../css/Input.module.css";

const WRAPPER_VARIANTS = {
  otp: styles.wrapperOtp,
  bare: styles.wrapperBare,
};

/**
 * Campo de formulario con etiqueta opcional (children) e icono opcional.
 *
 * Con onIconClick el icono es un botón (p. ej. mostrar/ocultar la contraseña): iconLabel es
 * su nombre accesible y debe describir la acción ("Mostrar contraseña"). Sin onIconClick el
 * icono es decorativo.
 */
const Input = ({
  value,
  type = "text",
  placeholder,
  variant,
  id,
  children,
  onChange,
  icon,
  onIconClick,
  iconLabel,
  ...rest
}) => {
  return (
    <div className={styles.container}>
      {children && (
        <label className={styles.label} htmlFor={id}>
          {children}
        </label>
      )}
      <div
        className={`${styles.inputWrapper} ${WRAPPER_VARIANTS[variant] ?? styles.wrapperDefault}`}
      >
        <input
          className={`${styles.input} ${variant === "otp" ? styles.inputOtp : ""}`}
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          {...rest}
        />

        {icon && onIconClick && (
          <button
            type="button"
            className={styles.icon}
            onClick={onIconClick}
            aria-label={iconLabel}
            aria-controls={id}
          >
            {icon}
          </button>
        )}
        {icon && !onIconClick && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;
