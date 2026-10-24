import { NavLink } from "react-router-dom";
import styles from "../Sidebar/Sidebar.module.css";

/** @param {{badge?: number}} props badge: contador (p. ej. alertas pendientes); 0 lo oculta */
const NavItem = ({ to, icon, label, collapsed, onClick, badge = 0, badgeLabel }) => {
  const collapsedLabel = badge > 0 && badgeLabel ? `${label}, ${badgeLabel}` : label;
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
      // Contraído solo queda el icono: el nombre va en aria-label y en el tooltip.
      aria-label={collapsed ? collapsedLabel : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={styles.iconWrap}>
        {icon}
        {badge > 0 && (
          <>
            <span className={styles.badge} aria-hidden="true">
              {badge > 99 ? "99+" : badge}
            </span>
            <span className="sr-only">{badgeLabel}</span>
          </>
        )}
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default NavItem;
