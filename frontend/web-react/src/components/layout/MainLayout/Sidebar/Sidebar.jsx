import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import styles from "../Sidebar/Sidebar.module.css";
import logoProyecto from "../../../../assets/logo_proyecto.png";
import NavProjects from "./NavProjects";

import {
  Menu,
  Home,
  CloudLightning,
  Heart,
  Bell,
  Settings,
  MoreHorizontal,
  Plus,
  User,
} from "lucide-react";

import NavItem from "./NavItem";
import Button from "../../../../design/components/Button/Button";

import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";
import Account from "../../../../features/Account/Account";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        className={styles.triggerMobile}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Menu size={24} />
      </button>

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}
        style={{ padding: spacing.md }}
      >
        {/* HEADER */}
        <div className={styles.top}>
          <button onClick={() => setCollapsed(!collapsed)} className={styles.toggle}>
            <Menu size={24} />
          </button>
          <img src={logoProyecto} alt="EnergyMonitor" className={styles.logo} />
          {!collapsed && (
            <span className={styles.brandName}>EnergyMonitor</span>
          )}
        </div>

        {/* NAV */}
        <nav className={styles.nav}>
          <NavItem to="/dashboard" icon={<Home size={24} />} label="Inicio" collapsed={collapsed} onClick={() => setIsOpen(false)} />
          <div className={styles.navGroup}>
            <NavProjects icon={<CloudLightning size={24} />} label="Proyectos" collapsed={collapsed} />
          </div>
          <NavItem to="/favorites" icon={<Heart size={24} />} label="Favoritos" collapsed={collapsed} />
          <NavItem to="/notifications" icon={<Bell size={24} />} label="Notificaciones" collapsed={collapsed} />
          <NavItem to="/settings" icon={<Settings size={24} />} label="Ajustes" collapsed={collapsed} />
        </nav>

        {/* PERFIL */}
        <div className={styles.profile} ref={dropdownRef}>
          <div
            className={styles.profileInfo}
            onClick={() => { setShowProfile(true); setOpenMenu(false); }}
            style={{ cursor: "pointer" }}
          >
            <img src="https://i.pravatar.cc/40" alt="user" className={styles.avatar} />

            {!collapsed && (
              <span style={{ fontFamily: typography.fontPrimary, fontSize: typography.sizes.md, color: "#FFFFFF" }}>
                User001
              </span>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }}
              className={styles.menuBtn}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {openMenu && (
            <div className={styles.dropdown}>
              <div className={styles.item} onClick={() => { setShowProfile(true); setOpenMenu(false); }}>
                <User size={24} /> Mi cuenta
              </div>
              <div className={styles.item}>
                <Plus size={24} /> Añadir cuenta
              </div>
              <div className={styles.divider} />
              <div className={styles.item}>
                <Button type="submit" variant="primary" onClick={() => navigate("/home")} style={{ width: "100%" }}>
                  Cerrar sesión
                </Button>
              </div>
            </div>
          )}
        </div>

        {showProfile && (
          <div className={styles.modalOverlay} onClick={() => setShowProfile(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Account onClose={() => setShowProfile(false)} />
            </div>
          </div>
        )}
      </aside>

      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;