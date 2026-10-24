import NavItem from "./NavItem";
import styles from "./Navbar.module.css";
import { useTranslation } from "react-i18next";

/** @param {{ onNavigate?: () => void }} props onNavigate: cierra el menú móvil al elegir un enlace */
const NavList = ({ onNavigate }) => {
  const { t } = useTranslation("navbar");
  return (
    <ul className={styles.navLinks}>
      <NavItem text={t("menu.home")} path="/" onNavigate={onNavigate} />
      <NavItem text={t("menu.about")} path="/about" onNavigate={onNavigate} />
      <NavItem text={t("menu.support")} path="/support" onNavigate={onNavigate} />
    </ul>
  );
};

export default NavList;
