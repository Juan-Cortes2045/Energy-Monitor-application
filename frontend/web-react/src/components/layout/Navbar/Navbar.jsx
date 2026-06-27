import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { Menu, X } from "lucide-react";

import NavList from "./NavList";
import styles from "./Navbar.module.css";

import LogoProyecto from "../../../assets/logo_proyecto.png";

import Button from "../../../design/components/Button/Button";
import spacing from "../../../design/tokens/spacing";
import shadows from "../../../design/tokens/shadows";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={styles.navbar}
      style={{
        backgroundColor: "var(--color-surface)",
        padding: `0 ${spacing.lg}`,
        boxShadow: shadows.md,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className={styles.logo}>
        <img src={LogoProyecto} alt="EnergyMonitor" />

        <span className={styles.logoText}>
          EnergyMonitor
        </span>
      </div>

      <div className={`${styles.center} ${open ? styles.open : ""}`}>
        <NavList setOpen={setOpen} />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate("/register")}
          >
            Registrate
          </Button>

          <Button
            variant="primary"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </Button>
        </div>
      </div>

      <button
        className={styles.menuBtn}
        onClick={() => setOpen(!open)}
        aria-label="Abrir menú"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;