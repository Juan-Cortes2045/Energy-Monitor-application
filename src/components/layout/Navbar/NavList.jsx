import NavItem from "./NavItem";
import styles from "./Navbar.module.css";
import { useTranslation } from "react-i18next";

const NavList = ({ setOpen }) => {
  const { t } = useTranslation("navbar");
  return (
    <ul className={styles.navLinks}>
      <NavItem text={t("menu.home")} path="/" />
      <NavItem text={t("menu.howItWorks")} path="/how-it-works" />
      <NavItem text={t("menu.benefits")} path="/benefits" />
      <NavItem text={t("menu.about")} path="/about" />
      <NavItem text={t("menu.support")} path="/support" />
    </ul>
  );
};

export default NavList;