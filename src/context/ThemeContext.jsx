import { useContext, useLayoutEffect, useState } from "react";
import { THEMES, THEME_STORAGE_KEY } from "./themeConstants";
import ThemeContext from "./ThemeContextCore";

const STORAGE_KEY = THEME_STORAGE_KEY;
const findTheme = (id) => THEMES.find((t) => t.id === id) ?? THEMES[0];

function applyThemeVars(theme) {
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([prop, value]) => {
        root.style.setProperty(prop, value);
    });
    root.setAttribute("data-theme", theme.id);
}

function readStoredTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null; // almacenamiento bloqueado: tema por defecto
    }
}

export function ThemeProvider({ children }) {
    // Un id guardado que ya no existe cae al tema por defecto (y se corrige al guardar).
    const [themeId, setThemeId] = useState(() => findTheme(readStoredTheme()).id);

    // Antes del primer pintado, para no mostrar el tema claro un instante con el oscuro guardado.
    useLayoutEffect(() => {
        applyThemeVars(findTheme(themeId));
        try {
            localStorage.setItem(STORAGE_KEY, themeId);
        } catch {
            // sin almacenamiento: el tema vale solo para esta visita
        }
    }, [themeId]);

    const currentTheme = findTheme(themeId);

    return (
        <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme, themes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}

// useTheme sigue aquí porque las pantallas lo importan de este archivo.
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
    return ctx;
}
