import styles from "../../css/Input.module.css";

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
      <label className={styles.label} htmlFor={id}>
        {children}
      </label>
      <div
        className={`${styles.inputWrapper} ${variant === "otp" ? styles.wrapperOtp : styles.wrapperDefault}`}
      >
        <input
          className={`${styles.input} ${variant === "otp" ? styles.inputOtp : ""}`}
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
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