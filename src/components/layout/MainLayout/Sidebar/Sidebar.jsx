import { useNavigate } from "react-router-dom";
import { useCurrentPerson } from "../../../../services/auth/useCurrentPerson";
import { logout } from "../../../../services/auth/authApi";
import { lazy, Suspense, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

import styles from "../Sidebar/Sidebar.module.css";
import logoHome from "../../../../assets/logo_proyecto.webp";
import NavHomes from "./NavHomes";

import {
  Menu,
  X,
  Home,
  CloudLightning,
  Heart,
  Bell,
  Settings,
  MoreHorizontal,
  User,
  ShieldCheck,
} from "lucide-react";

import NavItem from "./NavItem";
import { useNotificationCenter } from "../../../../context/useNotificationCenter";
import { useFocusTrap } from "../../../../hooks/useFocusTrap";
import Button from "../../../../design/components/Button/Button";
import { usePermissions } from "../../../../services/auth/usePermissions";

// El perfil solo se descarga al abrirlo (la ruta /account también lo carga en diferido).
const Account = lazy(() => import("../../../../features/Account/Account"));

const SIDEBAR_ID = "app-sidebar";
const MENU_ID = "sidebar-profile-menu";
const MOBILE_QUERY = "(max-width: 768px)";

const Sidebar = () => {
  const { t } = useTranslation("sidebar");
  const { pendingCount } = useNotificationCenter();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  // Abierto en móvil siempre se ve completo, aunque en escritorio se hubiera contraído.
  const isCollapsed = collapsed && !isOpen;
  const person = useCurrentPerson();
  const { isAdmin } = usePermissions();
  const displayName =
    [person?.name, person?.lastName].filter(Boolean).join(" ") || person?.email || "";
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const menuBtnRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  // En móvil el menú abierto es un panel sobre la página: foco atrapado dentro, Escape lo
  // cierra y el foco vuelve al botón de menú.
  useFocusTrap(sidebarRef, isOpen, { onEscape: () => setIsOpen(false) });

  // Si la ventana pasa a escritorio con el panel abierto, se cierra (allí no hay overlay).
  useEffect(() => {
    const media = globalThis.matchMedia?.(MOBILE_QUERY);
    if (!media) return undefined;
    const onChange = (e) => {
      if (!e.matches) setIsOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const closeMenu = (returnFocus) => {
    setOpenMenu(false);
    if (returnFocus) menuBtnRef.current?.focus();
  };

  const openAccount = () => {
    setShowProfile(true);
    setOpenMenu(false);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.triggerMobile} ${isOpen ? styles.triggerHidden : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={isOpen}
        aria-controls={SIDEBAR_ID}
      >
        <Menu size={24} />
      </button>

      <aside
        id={SIDEBAR_ID}
        ref={sidebarRef}
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}
      >
        {/* HEADER */}
        <div className={styles.top}>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={styles.toggle}
            aria-label={collapsed ? t("expand") : t("collapse")}
            aria-expanded={!collapsed}
            aria-controls={SIDEBAR_ID}
          >
            <Menu size={24} />
          </button>
          {/* Cerrar el panel en móvil sin tener que tocar fuera. */}
          <button
            type="button"
            className={styles.closeMobile}
            onClick={() => setIsOpen(false)}
            aria-label={t("closeMenu")}
          >
            <X size={24} />
          </button>
          {/* El nombre ya está al lado: el logo es decorativo. */}
          <img src={logoHome} alt="" width="256" height="256" className={styles.logo} />
          <h1 className={styles.title}>EnergyMonitor</h1>
        </div>

        {/* NAV */}
        <nav className={styles.nav} aria-label={t("mainNav")}>
          {/* Una cuenta de administración solo ve la administración, sus notificaciones y los ajustes. */}
          {isAdmin ? (
            <NavItem
              to="/admin/users"
              icon={<ShieldCheck size={24} />}
              label={t("admin")}
              collapsed={isCollapsed}
              onClick={() => setIsOpen(false)}
            />
          ) : (
            <>
              <NavItem
                to="/dashboard"
                icon={<Home size={24} />}
                label={t("home")}
                collapsed={isCollapsed}
                onClick={() => setIsOpen(false)}
              />
              <div className={styles.navGroup}>
                <NavHomes
                  icon={<CloudLightning size={24} />}
                  label={t("homes")}
                  collapsed={isCollapsed}
                  onExpand={() => setCollapsed(false)}
                  onNavigate={() => setIsOpen(false)}
                />
              </div>
              <NavItem
                to="/favorites"
                icon={<Heart size={24} />}
                label={t("favorites")}
                collapsed={isCollapsed}
                onClick={() => setIsOpen(false)}
              />
            </>
          )}
          <NavItem
            to="/notifications"
            icon={<Bell size={24} />}
            label={t("notifications")}
            collapsed={isCollapsed}
            onClick={() => setIsOpen(false)}
            badge={pendingCount}
            badgeLabel={t("pendingNotifications", { count: pendingCount })}
          />
          <NavItem
            to="/settings"
            icon={<Settings size={24} />}
            label={t("settings")}
            collapsed={isCollapsed}
            onClick={() => setIsOpen(false)}
          />
        </nav>

        {/* PERFIL */}
        <div
          className={styles.profile}
          ref={dropdownRef}
          onKeyDown={(e) => {
            if (e.key === "Escape" && openMenu) {
              e.stopPropagation(); // cierra solo el menú, no el panel móvil
              closeMenu(true);
            }
          }}
        >
          <div className={styles.profileInfo}>
            <button
              type="button"
              className={styles.profileBtn}
              onClick={openAccount}
              aria-label={t("profile.myAccount")}
              title={isCollapsed ? t("profile.myAccount") : undefined}
            >
              {person?.profileImage ? (
                <img src={person.profileImage} alt="" width="36" height="36" className={styles.avatar} />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarPlaceholder}`} aria-hidden="true">
                  <User size={20} />
                </span>
              )}

              {!isCollapsed && <span className={styles.profileName}>{displayName}</span>}
            </button>

            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setOpenMenu(!openMenu)}
              className={styles.menuBtn}
              aria-label={t("profileMenu")}
              aria-expanded={openMenu}
              aria-controls={MENU_ID}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* DROPDOWN */}
          {openMenu && (
            <div id={MENU_ID} className={styles.dropdown}>
              <button type="button" className={styles.item} onClick={openAccount}>
                <User size={24} /> {t("profile.myAccount")}
              </button>

              <div className={styles.divider} />

              <div className={styles.itemPlain}>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    logout(); // la sesión local se borra al instante; el aviso al backend sigue en segundo plano
                    navigate("/home", { replace: true });
                  }}
                  style={{ width: "100%" }}
                >
                  {t("profile.logout")}
                </Button>
              </div>
            </div>
          )}
        </div>

        {showProfile &&
          createPortal(
            <Suspense fallback={null}>
              <Account onClose={() => setShowProfile(false)} />
            </Suspense>,
            document.body,
          )}
      </aside>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)} aria-hidden="true" />
      )}
    </>
  );
};

export default Sidebar;
