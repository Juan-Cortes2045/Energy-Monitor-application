import { NavLink } from "react-router-dom";
import styles from "../Sidebar/Sidebar.module.css";

/** @param {{badge?: number}} props badge: contador (p. ej. alertas pendientes); 0 lo oculta */
const NavItem = ({ to, icon, label, collapsed, onClick, badge = 0, badgeLabel }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
      style={({ isActive }) => ({
        color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.8)",
      })}
    >
      <span className={styles.iconWrap}>
        {icon}
        {badge > 0 && (
          <span className={styles.badge} aria-label={badgeLabel}>
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default NavItem;
