import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import styles from "../../css/BreadCrumb.module.css";

const BreadCrumb = ({ items = [] }) => {
  if (items.length === 0) return null;

  return (
    <nav className={styles.breadcrumb}>
      <ol className={styles.breadcrumbList}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
            {item.path ? (
              <Link to={item.path} className={styles.breadcrumbLink}>
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                type="button"
                className={styles.breadcrumbLink}
                onClick={item.onClick}
              >
                {item.label}
              </button>
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