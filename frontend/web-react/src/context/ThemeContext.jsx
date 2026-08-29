import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
    {
        id: "energy-light",
        name: "EnergyMonitor",
        subtitle: "Claro · Predeterminado",
        mode: "light",
        sidebar: "#3F6BAE",
        main: "#0078D7",
        indicators: ["#0078D7", "#32CD32", "#E2E8F0"],
        vars: {
            "--color-primary":         "#0078D7",
            "--color-primary-hover":   "#3399FF",
            "--color-primary-dark":    "#0A2540",
            "--color-primary-soft":    "#E8F3FF",   /* fondo suave para badges e iconos */
            "--color-secondary":       "#32CD32",
            "--color-background":      "#F8F9FA",
            "--color-background-left": "#3F6BAE",
            "--color-surface":         "#FFFFFF",
            "--color-gradient":        "#E6F0FA",
            "--color-text-primary":    "#212529",
            "--color-text-secondary":  "#6C757D",
            "--color-border":          "#E5E7EB",

            "--color-danger-soft":       "#FCEBEB",
            "--color-danger-soft-hover": "#F7C1C1",
            "--color-danger-text":       "#A32D2D",
            "--color-success-soft":      "#EAF3DE",
            "--color-success-text":      "#3B6D11",
            "--color-warning-soft":      "#FFF4D6",
            "--color-warning-text":      "#854F0B",
        },
    },
    {
        id: "eco-light",
        name: "Eco Hogar",
        subtitle: "Claro · Tema 2",
        mode: "light",
        sidebar: "#2E7D32",
        main: "#32CD32",
        indicators: ["#1B5E20", "#2ECC71", "#A5D6A7"],
        vars: {
            "--color-primary":         "#2E7D32",
            "--color-primary-hover":   "#43A047",
            "--color-primary-dark":    "#1B5E20",
            "--color-primary-soft":    "#E8F5E9",
            "--color-secondary":       "#2ECC71",
            "--color-background":      "#F1F8F2",
            "--color-background-left": "#2E7D32",
            "--color-surface":         "#FFFFFF",
            "--color-gradient":        "#E8F5E9",
            "--color-text-primary":    "#1A2E1B",
            "--color-text-secondary":  "#5A7A5C",
            "--color-border":          "#C8E6C9",

            "--color-danger-soft":       "#FCEBEB",
            "--color-danger-soft-hover": "#F7C1C1",
            "--color-danger-text":       "#A32D2D",
            "--color-success-soft":      "#E8F5E9",
            "--color-success-text":      "#2E7D32",
            "--color-warning-soft":      "#FFF4D6",
            "--color-warning-text":      "#854F0B",
        },
    },
    {
        id: "energy-dark",
        name: "EnergyMonitor Dark",
        subtitle: "Oscuro · Tema 1",
        mode: "dark",
        sidebar: "#0F172A",
        main: "#1E293B",
        indicators: ["#0078D7", "#32CD32", "#64748B"],
        vars: {
            "--color-primary":         "#3B82F6",
            "--color-primary-hover":   "#60A5FA",
            "--color-primary-dark":    "#1E40AF",
            "--color-primary-soft":    "rgba(59,130,246,0.15)",
            "--color-secondary":       "#32CD32",
            "--color-background":      "#0F172A",
            "--color-background-left": "#0F172A",
            "--color-surface":         "#1E293B",
            "--color-gradient":        "#1E293B",
            "--color-text-primary":    "#F1F5F9",
            "--color-text-secondary":  "#94A3B8",
            "--color-border":          "#334155",

            "--color-danger-soft":       "rgba(230,57,70,0.15)",
            "--color-danger-soft-hover": "rgba(230,57,70,0.28)",
            "--color-danger-text":       "#FCA5A5",
            "--color-success-soft":      "rgba(46,204,113,0.15)",
            "--color-success-text":      "#6EE7B7",
            "--color-warning-soft":      "rgba(255,215,0,0.15)",
            "--color-warning-text":      "#FCD34D",
        },
    },
    {
        id: "eco-dark",
        name: "Eco Dark",
        subtitle: "Oscuro · Tema 2",
        mode: "dark",
        sidebar: "#102A1A",
        main: "#183321",
        indicators: ["#32CD32", "#2ECC71", "#1E4029"],
        vars: {
            "--color-primary":         "#22C55E",
            "--color-primary-hover":   "#4ADE80",
            "--color-primary-dark":    "#14532D",
            "--color-primary-soft":    "rgba(34,197,94,0.15)",
            "--color-secondary":       "#2ECC71",
            "--color-background":      "#0A1F0F",
            "--color-background-left": "#102A1A",
            "--color-surface":         "#183321",
            "--color-gradient":        "#183321",
            "--color-text-primary":    "#ECFDF5",
            "--color-text-secondary":  "#6EE7B7",
            "--color-border":          "#1E4029",

            "--color-danger-soft":       "rgba(230,57,70,0.15)",
            "--color-danger-soft-hover": "rgba(230,57,70,0.28)",
            "--color-danger-text":       "#FCA5A5",
            "--color-success-soft":      "rgba(34,197,94,0.15)",
            "--color-success-text":      "#4ADE80",
            "--color-warning-soft":      "rgba(255,215,0,0.15)",
            "--color-warning-text":      "#FCD34D",
        },
    },
];

const STORAGE_KEY = "energymonitor_theme";

function applyThemeVars(theme) {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
    });
    root.setAttribute("data-theme", theme.id);
}

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [themeId, setThemeId] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) ?? "energy-light";
    });

    useEffect(() => {
        const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];
        applyThemeVars(theme);
        localStorage.setItem(STORAGE_KEY, themeId);
    }, [themeId]);

    const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

    return (
        <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
    return ctx;
};

export default ThemeContext;