import styles from "../../css/Input.module.css";
import colors from "../../tokens/colors";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

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
  const variantStyles = {
    default: {
      width: "100%",
    },

    otp: {
      width: "45px",
      height: "45px",
      textAlign: "center",
      fontSize: "18px",
      border: `2px solid ${colors.secondary}`,
      borderRadius: "10px",
      boxShadow: shadows.md,
    },
  };

  return (
    <div className={styles.container}>
      <label
        className={styles.label}
        htmlFor={id}
        style={{
          fontFamily: typography.fontPrimary,
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.bold,
          color: colors.textPrimary,
        }}
      >
        {children}
      </label>
      <div
        className={styles.inputWrapper}
        style={
          variant === "otp"
            ? {
                padding: 0,
                border: "none",
                display: "inline-flex",
                borderRadius: radius.md,
              }
            : {
                borderRadius: radius.sm,
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.textSecondary}`,
              }
        }
      >
        <input
          className={`${styles.input} ${styles[variant] || ""}`}
          id={id}
          type={type}
          value={value}
          variant={variant}
          placeholder={placeholder}
          onChange={onChange}
          {...rest}
          style={{
            fontSize: typography.sizes.sm,
            color: colors.textPrimary,
            fontFamily: typography.textPrimary,
            ...(variantStyles[variant] || {}),
          }}
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
