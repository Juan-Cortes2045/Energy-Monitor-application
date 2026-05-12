import styles from "./Navbar.module.css"
import {Link} from "react-router-dom"

import colors from "../../../design/tokens/colors";
import typography from "../../../design/tokens/typography";

const NavItem = ({ path, text, setOpen }) => {
  return (
    <li>
      <Link 
      className={styles.link}
      to={path}
      onClick={() => setOpen && setOpen(false)}
      style={{
        color: colors.textSecondary,
        fontFamily: typography.fontPrimary,
        fontWeight: typography.weights.medium,
      }}
      onMouseEnter={(e)=>
      (e.target.style.color= colors.primary)
      }
      onMouseLeave={(e) =>
      (e.target.style.color= colors.textSecondary)
      }
      >
        {text}
      </Link>
    </li>
  );
};

export default NavItem;
