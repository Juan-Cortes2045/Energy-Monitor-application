import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import styles from "../../css/BreadCrumb.module.css";

import colors from "../../tokens/colors";
import spacing from "../../tokens/spacing";
import typography from "../../tokens/typography";

const BreadCrumb = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <nav
      className={styles.breadcrumb}
      style={{
        "--bc-spacing": spacing.md,
        "--bc-spacing-sm": spacing.sm,
        "--bc-text-color": colors.textSecondary,
        "--bc-link-color": colors.primary,
        "--bc-font-size": typography.sizes.sm,
        "--bc-font-family": typography.fontPrimary,
        "--bc-icon-color": colors.textSecondary,
      }}
    >
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
            {item.path ? (
              <Link to={item.path} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : (
              <span className={styles.breadcrumbCurrent}>{item.label}</span>
            )}

            {index < items.length - 1 && (
              <span className={styles.separator}>
                <ChevronRight size={20} strokeWidth={2} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default BreadCrumb;
