import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import BreadCrumb from "../BreadCrumb/BreadCrumb";
import styles from "../../css/Header.module.css";

const Header = ({
  breadcrumbItems = [],
  onActionClick = null,
  actionLabel,
  children,
}) => {
  const { t } = useTranslation("common");
  const label = actionLabel ?? t("add");
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
              type="button"
              className={styles.actionButton}
              onClick={onActionClick}
              title={label}
              aria-label={label}
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