import NavList from "./NavList";
import styles from "./Navbar.module.css";
import LogoProyecto from "../../../assets/logo_proyecto.png";
import { useNavigate } from "react-router-dom";

import colors from "../../../design/tokens/colors"
import shadows from "../../../design/tokens/shadows";
import spacing from "../../../design/tokens/spacing";

import Button from "../../../design/components/Button/Button";

const Navbar = () => {
  const navigate =useNavigate();

  return (
    <nav className={styles.navbar} 
    style={{
      backgroundColor: colors.surface,
      padding: `0 ${spacing.lg}`,
      boxShadow: shadows.md,
      borderBotton: `1px solid ${colors.border}`,
    }}>
      <div className={styles.logo}>
        <img src={LogoProyecto} alt="EnergyMonitor" />
      </div>
      <div className={styles.center}>
        <NavList />
      </div>
      
      <div className={styles.actions}>
        <Button 
        variant="secondary" 
        onClick={()=> navigate("/register")}
        >
          Registrate
        </Button>

        <Button 
        variant="primary" 
        onClick={()=> navigate("/login")}
        >
          Iniciar Sesión
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
