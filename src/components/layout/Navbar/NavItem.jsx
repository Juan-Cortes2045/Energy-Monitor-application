import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const NavItem = ({ path, text, setOpen }) => {
  return (
    <li>
      <Link
        to={path}
        className={styles.link}
        onClick={() => setOpen?.(false)}
      >
        {text}
      </Link>
    </li>
  );
};

export default NavItem;