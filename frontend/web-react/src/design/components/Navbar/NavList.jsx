import NavItem from "./NavItem";
import { styles } from "./navbar.styles";

const NavList = () => {
  return (
    <ul style={styles.navLinks} className="navbar_links">
      <NavItem text="Crear proyecto" path="#" />
      <NavItem text="Proyecto" path="#" />
      <NavItem text="Perfil" path="#" />
      <NavItem text="Configuración" path="#" />
    </ul>
  );
};

export default NavList;
