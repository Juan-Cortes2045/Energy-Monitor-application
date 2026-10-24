import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const NavItem = ({ path, text, onNavigate }) => {
  return (
    <li>
      <Link to={path} className={styles.link} onClick={() => onNavigate?.()}>
        {text}
      </Link>
    </li>
  );
};

export default NavItem;
