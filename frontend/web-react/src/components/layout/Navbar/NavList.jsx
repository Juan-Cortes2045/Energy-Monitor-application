import NavItem from "./NavItem";
import styles from "./Navbar.module.css"

const NavList = ({setOpen}) => {
  return (
    <ul className={styles.navLinks}>
      <NavItem text="Inicio" path="/" />
      <NavItem text="Como funciona" path="/how-it-works" />
      <NavItem text="Beneficios" path="/benefics" />
      <NavItem text="Sobre nosotros" path="/about" />
      <NavItem text="Soporte" path="/support" />
    </ul>
  );
};

export default NavList;
