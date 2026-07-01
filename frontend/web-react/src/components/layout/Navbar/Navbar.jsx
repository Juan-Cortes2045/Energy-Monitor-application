import NavList from "./NavList";
import styles from "./Navbar.module.css";
import LogoProyecto from "../../../assets/logo_proyecto.png";
import { useNavigate } from "react-router-dom";
import { useReducer, useState } from "react";
import { useTranslation } from "react-i18next";

import { Menu, X } from "lucide-react";
import colors from "../../../design/tokens/colors";
import shadows from "../../../design/tokens/shadows";
import spacing from "../../../design/tokens/spacing";

import Button from "../../../design/components/Button/Button";

const Navbar = () => {
  const { t } = useTranslation("navbar");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <nav
      className={styles.navbar}
      style={{
        backgroundColor: colors.surface,
        padding: `0 ${spacing.lg}`,
        boxShadow: shadows.md,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div className={styles.logo}>
        <img src={LogoProyecto} alt="EnergyMonitor" />
      </div>

      <div className={`${styles.center} ${open ? styles.open : ""}`}>
        <NavList setOpen={setOpen} />
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate("/register")}>
            {t("register")}
          </Button>

          <Button variant="primary" onClick={() => navigate("/login")}>
            {t("login")}
          </Button>
        </div>
      </div>

      <button className={styles.menuBtn} onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;
