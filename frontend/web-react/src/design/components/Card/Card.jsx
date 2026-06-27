import styles from "../../css/Card.module.css";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

const Card = ({ title, children, style = {}, maxWidth = "100%" }) => {
  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: radius.md,
        padding: spacing.lg,
        boxShadow: shadows.lg,
        maxWidth,
        ...style,
      }}
    >
      {title && (
        <h3
          className={styles.title}
          style={{
            fontFamily: typography.fontPrimary,
            fontSize: typography.sizes.lg,
            fontWeight: typography.weights.bold,
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h3>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;