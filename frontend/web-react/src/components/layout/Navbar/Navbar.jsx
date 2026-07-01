import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme, THEMES } from "../../../context/ThemeContext";

import { Menu, X, Sun, Moon, Globe } from "lucide-react";

import NavList from "./NavList";
import styles from "./Navbar.module.css";
import LogoProyecto from "../../../assets/logo_proyecto.png";
import Button from "../../../design/components/Button/Button";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇨🇴" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

const Navbar = () => {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { themeId, setThemeId, currentTheme } = useTheme();
  const isDark = currentTheme.mode === "dark";

  const toggleTheme = () => {
    if (themeId === "energy-light") setThemeId("energy-dark");
    else if (themeId === "energy-dark") setThemeId("energy-light");
    else if (themeId === "eco-light") setThemeId("eco-dark");
    else setThemeId("eco-light");
  };

  const handleLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
    setLangOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <nav className={styles.navbar}>
      {/* LOGO */}
      <div className={styles.logo}>
        <img src={LogoProyecto} alt="EnergyMonitor" />
        <span className={styles.logoText}>EnergyMonitor</span>
      </div>

      {/* CENTRO */}
      <div className={`${styles.center} ${open ? styles.open : ""}`}>
        <NavList setOpen={setOpen} />

        <div className={styles.actions}>
          {/* Toggle tema */}
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Selector idioma */}
          <div className={styles.langWrapper}>
            <button
              className={styles.iconBtn}
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Cambiar idioma"
            >
              <Globe size={18} />
              <span className={styles.langFlag}>{currentLang.flag}</span>
            </button>

            {langOpen && (
              <ul className={styles.langDropdown}>
                {LANGUAGES.map((lang) => (
                  <li
                    key={lang.code}
                    className={`${styles.langOption} ${i18n.language === lang.code ? styles.langActive : ""}`}
                    onClick={() => handleLang(lang.code)}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Button variant="secondary" onClick={() => navigate("/register")}>
            {t("register")}
          </Button>

          <Button variant="primary" onClick={() => navigate("/login")}>
            {t("login")}
          </Button>
        </div>
      </div>

      {/* Hamburguesa */}
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