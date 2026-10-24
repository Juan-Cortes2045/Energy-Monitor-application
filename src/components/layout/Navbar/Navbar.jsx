import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import { useTheme } from "../../../context/ThemeContext";

import { Menu, X, Sun, Moon, Globe } from "lucide-react";

import NavList from "./NavList";
import styles from "./Navbar.module.css";
import LogoProyecto from "../../../assets/logo_proyecto.webp";
import Button from "../../../design/components/Button/Button";

const LANGUAGES = [
  { code: "es", label: "Español", countryCode: "CO" },
  { code: "en", label: "English", countryCode: "US" },
  { code: "fr", label: "Français", countryCode: "FR" },
  { code: "pt", label: "Português", countryCode: "BR" },
];

const MENU_ID = "navbar-menu";
const LANG_LIST_ID = "navbar-languages";

const Navbar = () => {
  const { t, i18n } = useTranslation("navbar");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const langBtnRef = useRef(null);
  const menuBtnRef = useRef(null);

  const { themeId, setThemeId, currentTheme } = useTheme();
  const isDark = currentTheme.mode === "dark";

  const toggleTheme = () => {
    if (themeId === "energy-light") setThemeId("energy-dark");
    else if (themeId === "energy-dark") setThemeId("energy-light");
    else if (themeId === "eco-light") setThemeId("eco-dark");
    else setThemeId("eco-light");
  };

  // i18n/index.js ya guarda el idioma elegido y actualiza <html lang>.
  const handleLang = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
    langBtnRef.current?.focus();
  };

  // El selector de idioma se cierra al tocar fuera.
  useEffect(() => {
    if (!langOpen) return undefined;
    const onPointerDown = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [langOpen]);

  // Escape cierra primero el selector de idioma y luego el menú móvil, devolviendo el foco a su botón.
  const handleKeyDown = (e) => {
    if (e.key !== "Escape") return;
    if (langOpen) {
      setLangOpen(false);
      langBtnRef.current?.focus();
    } else if (open) {
      setOpen(false);
      menuBtnRef.current?.focus();
    }
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  return (
    <header className={styles.navbar} onKeyDown={handleKeyDown}>
      {/* LOGO: el nombre está al lado, la imagen es decorativa */}
      <div className={styles.logo}>
        <img src={LogoProyecto} alt="" width="256" height="256" />
        <span className={styles.logoText}>EnergyMonitor</span>
      </div>

      {/* CENTRO */}
      <div id={MENU_ID} className={`${styles.center} ${open ? styles.open : ""}`}>
        <nav aria-label={t("mainNav")}>
          <NavList onNavigate={() => setOpen(false)} />
        </nav>

        <div className={styles.actions}>
          {/* Toggle tema */}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={toggleTheme}
            aria-label={isDark ? t("themeToLight") : t("themeToDark")}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Selector idioma */}
          <div className={styles.langWrapper} ref={langRef}>
            <button
              ref={langBtnRef}
              type="button"
              className={styles.iconBtn}
              onClick={() => setLangOpen((v) => !v)}
              aria-label={`${t("changeLanguage")} (${currentLang.label})`}
              aria-expanded={langOpen}
              aria-controls={LANG_LIST_ID}
            >
              <Globe size={18} />
              <span className={styles.langFlag} aria-hidden="true">
                <ReactCountryFlag countryCode={currentLang.countryCode} svg style={{ width: "1.25em", height: "1.25em" }} />
              </span>
            </button>

            {langOpen && (
              <ul id={LANG_LIST_ID} className={styles.langDropdown}>
                {LANGUAGES.map((lang) => (
                  <li key={lang.code}>
                    <button
                      type="button"
                      lang={lang.code}
                      className={`${styles.langOption} ${i18n.language === lang.code ? styles.langActive : ""}`}
                      aria-current={i18n.language === lang.code ? "true" : undefined}
                      onClick={() => handleLang(lang.code)}
                    >
                      <span aria-hidden="true">
                        <ReactCountryFlag countryCode={lang.countryCode} svg style={{ width: "1.25em", height: "1.25em" }} />
                      </span>
                      <span>{lang.label}</span>
                    </button>
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
        ref={menuBtnRef}
        type="button"
        className={styles.menuBtn}
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        aria-expanded={open}
        aria-controls={MENU_ID}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
    </header>
  );
};

export default Navbar;
