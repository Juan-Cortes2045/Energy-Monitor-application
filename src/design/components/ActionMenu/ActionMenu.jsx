import { useState, useRef, useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import styles from "../../css/ActionMenu.module.css";

const ActionMenu = ({
  trigger = "plus",
  items = [],
  onItemClick = () => {},
  position = "bottom-right",
  label,
}) => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    onItemClick(item);
    setIsOpen(false);
  };

  // Escape cierra el menú y devuelve el foco al botón que lo abrió.
  const handleKeyDown = (event) => {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  const getTriggerIcon = () => {
    switch (trigger) {
      case "plus":
        return <Plus size={20} />;
      default:
        return <Plus size={20} />;
    }
  };

  return (
    <div className={styles.actionMenu} ref={menuRef} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label ?? t("openActions")}
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        {getTriggerIcon()}
      </button>

      {isOpen && (
        <div id={menuId} className={`${styles.menu} ${styles[position]}`}>
          {items.map((item, index) => (
            <button
              type="button"
              key={item.action ?? item.label ?? index}
              className={styles.menuItem}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
