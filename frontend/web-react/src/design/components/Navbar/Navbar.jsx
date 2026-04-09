import NavList from "./NavList";
import { styles } from "./navbar.styles";

const Navbar = () => {
  return (
    <nav style={styles.navbar} className="navbar">
      <div style={styles.logo} className="navbar_logo">
        Energy Monito
      </div>
      <NavList />
    </nav>
  );
};

export default Navbar;
