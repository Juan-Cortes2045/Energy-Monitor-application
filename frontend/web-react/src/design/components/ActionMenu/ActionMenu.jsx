import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import styles from "../../css/ActionMenu.module.css";

import colors from "../../../design/tokens/colors";
import spacing from "../../../design/tokens/spacing";
import typography from "../../../design/tokens/typography";
import radius from "../../../design/tokens/radius";
import shadows from "../../../design/tokens/shadows";

const ActionMenu = ({
  trigger = "plus",
  items = [],
  onItemClick = () => {},
  position = "bottom-right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    onItemClick(item);
    setIsOpen(false);
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
    <div
      className={styles.actionMenu}
      ref={menuRef}
      style={{
        "--am-spacing": spacing.sm,
        "--am-spacing-md": spacing.md,
        "--am-radius": radius.lg,
        "--am-shadow": shadows.md,
        "--am-primary": colors.primary,
        "--am-surface": colors.surface,
        "--am-border": colors.border,
        "--am-text-primary": colors.textPrimary,
        "--am-text-secondary": colors.textSecondary,
        "--am-font-family": typography.fontPrimary,
        "--am-font-size": typography.sizes.sm,
        "--am-font-weight": typography.weights.normal,
      }}
    >
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú de acciones"
      >
        {getTriggerIcon()}
      </button>

      {isOpen && (
        <div className={`${styles.menu} ${styles[position]}`}>
          {items.map((item, index) => (
            <button
              key={index}
              className={styles.menuItem}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className={styles.icon}>{item.icon}</span>}
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
