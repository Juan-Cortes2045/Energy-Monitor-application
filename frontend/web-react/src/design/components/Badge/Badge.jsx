import styles from "../../css/Badge.module.css";
import colors from "../../tokens/colors";

const Badge = ({
  children,
  variant = "primary",
  type = "filled", // filled | outline
  size = "medium",
}) => {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[size]}
        ${styles[type]}
      `}
      style={{
        backgroundColor: type === "filled" ? colors[variant] : "transparent",
        border: type === "outline" ? `1px solid ${colors[variant]}` : "none",
        color: type === "outline" ? colors[variant] : "#fff",
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
