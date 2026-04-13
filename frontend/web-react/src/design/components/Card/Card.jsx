import styles from "../../css/Card.module.css";
import colors from "../../tokens/colors";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import spacing from "../../tokens/spacing";
import shadows from "../../tokens/shadows";

const Card = ({ title, children }) => {
  return (
    <div className={styles.container}
    style={{
      backgroundColor: colors.surface,
      borderRadius: redius.md,
      padding: spacing.lg,
      boxShadow: shadows.lg,
    }}
    >
      {title && <h3 className={styles.title}
      style={{
        fontFamily: typography.fontPrimary,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.textPrimary,
      }}
      >{title}</h3>}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
