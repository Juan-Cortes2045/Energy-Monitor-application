import colors from "../../tokens/colors";
import spacing from "../../tokens/spacing";
import radius from "../../tokens/radius";
import shadows from "../../tokens/shadows";
import typography from "../../tokens/typography";

export const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: colors.surface,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: shadows.sm,

    fontFamily: typography.fontPrimary,
  },

  logo: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
  },

  navLinks: {
    display: "flex",
    gap: spacing.lg,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },

  link: {
    textDecoration: "none",
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    padding: spacing.sm,
    borderRadius: radius.sm,
    transition: "0.2s",
  },

  linkHover: {
    color: colors.primary,
    backgroundColor: "rgba(0,120,215,0.1)",
  },
};
