import styles from "../../css/Button.module.css";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

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
  const sizeStyles = {
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

  const variantStyles = {
    primary: {
      backgroundColor: "var(--color-primary)",
      color: "#fff",
      border: "none",
      boxShadow: shadows.md,
    },
    secondary: {
      backgroundColor: "var(--color-background)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border)",
      boxShadow: shadows.md,
    },
    Danger: {
      backgroundColor: "var(--color-background)",
      color: "var(--color-danger)",
      border: "1px solid var(--color-danger)",
      boxShadow: shadows.md,
      fontSize: typography.sizes.xl,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${styles.button}
        ${styles[size]}
        ${disabled ? styles.disabled : ""}
      `}
      style={{
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
        fontFamily: typography.fontPrimary,
        fontWeight: typography.weights.medium,
        borderRadius: radius.sm,
        whiteSpace: "nowrap",
      }}
    >
      {icon && <img src={icon} alt="icon" className={styles.icon} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;