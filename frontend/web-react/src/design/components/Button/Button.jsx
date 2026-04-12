import styles from "../../css/Button.module.css";
import colors from "../../tokens/colors";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

const Button = ({
  children,
  type = "button",
  icon,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
}) => {
  const  sizeStyles ={
    small: {
      padding: `${spacing.xs} ${spacing.sm}`,
      fontSize: typography.sizes.xs,
    },

    medium: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.sizes.sm,
    },

    large: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.sizes.md,
    },
  };

  const variantStyles ={
    primary:{
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
    },
    google:{
      backgroundColor: colors.primary,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
    }
  }

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
        backgroundColor: variant === "google"
        ? colors.surface
        : colors[variant] || colors.primary,
        color: variant === "google"
        ? colors.textPrimary
        : "white",
        border: variant === "google"
        ? `1px solid ${colors.border}`
        : "none",
      }}
    >
      {icon && <img src={icon} alt="icon" className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;
