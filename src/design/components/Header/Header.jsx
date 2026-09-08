import { Plus } from "lucide-react";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import styles from "../../css/Header.module.css";

const Header = ({
  breadcrumbItems = [],
  onActionClick = null,
  actionLabel = "Añadir",
  children,
}) => {
  return (
    <header className={styles.header}>
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