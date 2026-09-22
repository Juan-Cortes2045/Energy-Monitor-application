import styles from "../../css/Input.module.css";

  const WRAPPER_VARIANTS = {
    otp: styles.wrapperOtp,
    bare: styles.wrapperBare,
  };

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
        
        {icon && (
          <span className={styles.icon} onClick={onIconClick}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
};

export default Input;