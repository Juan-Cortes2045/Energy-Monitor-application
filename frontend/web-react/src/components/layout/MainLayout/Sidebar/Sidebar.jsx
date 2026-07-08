import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";


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
import Account from "../../../../features/Account/Account";

const Sidebar = () => {
  const { t } = useTranslation("sidebar");
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
      >
        {/* HEADER */}
        <div className={styles.top}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.toggle}
          >
            <Menu size={24} />
          </button>
          <img src={logoProyecto} alt="EnergyMonitor" className={styles.logo} />
          <h1 className={styles.title}>EnergyMonitor</h1>
        </div>

        {/* NAV */}
        <nav className={styles.nav}>
          <NavItem
            to="/dashboard"
            icon={<Home size={24} />}
            label={t("home")}
            collapsed={collapsed}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.navGroup}>
            <NavProjects
              icon={<CloudLightning size={24} />}
              label={t("projects")}
              collapsed={collapsed}
            />
          </div>
          <NavItem
            to="/favorites"
            icon={<Heart size={24} />}
            label={t("favorites")}
            collapsed={collapsed}
          />
          <NavItem
            to="/notifications"
            icon={<Bell size={24} />}
            label={t("notifications")}
            collapsed={collapsed}
          />
          <NavItem
            to="/settings"
            icon={<Settings size={24} />}
            label={t("settings")}
            collapsed={collapsed}
          />
        </nav>

        {/* PERFIL */}
        <div className={styles.profile} ref={dropdownRef}>
          <div
            className={styles.profileInfo}
            onClick={() => { setShowProfile(true); setOpenMenu(false); }}
            style={{ cursor: "pointer" }}
          >
            <img
              src="https://i.pravatar.cc/40"
              alt="user"
              className={styles.avatar}
            />

            {!collapsed && (
              <span className={styles.profileName}>User001</span>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu); }}
              className={styles.menuBtn}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* DROPDOWN */}
          {openMenu && (
            <div className={styles.dropdown}>
              <div
                className={styles.item}
                onClick={() => { setShowProfile(true); setOpenMenu(false); }}
              >
                <User size={24} /> {t("profile.myAccount")}
              </div>

              <div className={styles.item}>
                <Plus size={24} /> {t("profile.addAccount")}
              </div>

              <div className={styles.divider} />

              <div className={styles.item}>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => navigate("/home")}
                  style={{ width: "100%" }}
                >
                  {t("profile.logout")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {showProfile && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowProfile(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Account onClose={() => setShowProfile(false)} />
            </div>
          </div>
        )}
      </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default Sidebar;