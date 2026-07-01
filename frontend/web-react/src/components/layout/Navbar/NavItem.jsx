import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

import typography from "../../../design/tokens/typography";

const NavItem = ({ path, text, setOpen }) => {
  return (
    <li>
      <Link
        to={path}
        className={styles.link}
        onClick={() => setOpen?.(false)}
        style={{
          fontFamily: typography.fontPrimary,
          fontWeight: typography.weights.medium,
        }}
      >
        {text}
      </Link>
    </li>
  );
};

export default NavItem;