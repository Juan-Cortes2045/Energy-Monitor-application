import { NavLink } from "react-router-dom";
import styles from "../Sidebar/Sidebar.module.css"
import colors from "../../../../design/tokens/colors";

const NavItem = ({to, icon, label, collapsed})=>{
    return(
        <NavLink
        to={to}
        className={({isActive})=>
            `${styles.link} ${isActive ? styles.active: ""}`
        }
        style={({isActive}) =>({
            color: isActive ? "#FFFFFF": "rgba(255,255,255,0.8)",
        })}
        >       
            {icon}
            {!collapsed && <span>{label}</span>}
        </NavLink>
    );
}

export default NavItem;