import { styles } from "./navbar.styles";

const NavItem = ({ path, text }) => {
  return (
    <li>
      <a style={styles.link} href={path}>
        {text}
      </a>
    </li>
  );
};

export default NavItem;
