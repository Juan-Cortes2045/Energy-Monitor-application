import { Plus } from "lucide-react";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import styles from "../../css/Header.module.css";

import spacing from "../../tokens/spacing";
import typography from "../../tokens/typography";
import radius from "../../tokens/radius";
import shadows from "../../tokens/shadows";

const Header = ({
  breadcrumbItems = [],
  onActionClick = null,
  actionLabel = "Añadir",
  children,
}) => {
  return (
    <header
      className={styles.header}
      style={{
        "--header-bg":           "var(--color-surface)",
        "--header-border":       "var(--color-border)",
        "--header-spacing":      spacing.lg,
        "--header-spacing-sm":   spacing.md,
        "--header-radius":       radius.lg,
        "--header-shadow":       shadows.sm,
        "--header-text-color":   "var(--color-text-secondary)",
        "--header-action-color": "var(--color-primary)",
        "--header-font-family":  typography.fontPrimary,
      }}
    >
      <div className={styles.headerContent}>
        <div className={styles.breadcrumbWrapper}>
          <BreadCrumb items={breadcrumbItems} />
        </div>

        <div className={styles.actionsWrapper}>
          {children ? (
            children
          ) : onActionClick ? (
            <button
              className={styles.actionButton}
              onClick={onActionClick}
              title={actionLabel}
              aria-label={actionLabel}
            >
              <Plus size={20} />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;