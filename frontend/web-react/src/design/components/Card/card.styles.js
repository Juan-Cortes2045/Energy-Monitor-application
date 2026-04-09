import colors from "../../tokens/colors";
import spacing from "../../tokens/spacing";
import typography from "../../tokens/typography";
import shadows from "../../tokens/shadows";
import radius from "../../tokens/radius";

export const styles = {
  container: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    boxShadow: shadows.sm,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },

  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },

  content: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
};
