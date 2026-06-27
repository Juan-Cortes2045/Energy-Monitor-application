import NavItem from "./NavItem";
import styles from "./Navbar.module.css";

const NavList = ({ setOpen }) => {
  return (
    <ul className={styles.navLinks}>
      <NavItem
        text="Inicio"
        path="/"
        setOpen={setOpen}
      />

      <NavItem
        text="Como funciona"
        path="/how-it-works"
        setOpen={setOpen}
      />

      <NavItem
        text="Beneficios"
        path="/benefics"
        setOpen={setOpen}
      />

      <NavItem
        text="Sobre nosotros"
        path="/about"
        setOpen={setOpen}
      />

      <NavItem
        text="Soporte"
        path="/support"
        setOpen={setOpen}
      />
    </ul>
  );
};

export default NavList;