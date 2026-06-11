import { Palette, Check } from "lucide-react";
import { useState } from "react";
import Card from "../../../../design/components/Card/Card.jsx";
import styles from "./ThemeSettings.module.css";

const THEMES = [
    {
        id: "energy-light",
        name: "EnergyMonitor",
        subtitle: "Claro · Predeterminado",
        mode: "light",
        sidebar: "#3F6BAE",
        main: "#0078D7",
        indicators: ["#0078D7", "#32CD32", "#E2E8F0"],
    },
    {
        id: "eco-light",
        name: "Eco Hogar",
        subtitle: "Claro · Tema 2",
        mode: "light",
        sidebar: "#2E7D32",
        main: "#32CD32",
        indicators: ["#1B5E20", "#2ECC71", "#A5D6A7"],
    },
    {
        id: "energy-dark",
        name: "EnergyMonitor Dark",
        subtitle: "Oscuro · Tema 1",
        mode: "dark",
        sidebar: "#0F172A",
        main: "#1E293B",
        indicators: ["#0078D7", "#32CD32", "#64748B"],
    },
    {
        id: "eco-dark",
        name: "Eco Dark",
        subtitle: "Oscuro · Tema 2",
        mode: "dark",
        sidebar: "#102A1A",
        main: "#183321",
        indicators: ["#32CD32", "#2ECC71", "#1E4029"],
    },
];

const lightThemes = THEMES.filter((t) => t.mode === "light");
const darkThemes = THEMES.filter((t) => t.mode === "dark");

const ThemeSettings = () => {
    const [selected, setSelected] = useState("energy-light");

    const renderThemeCard = (theme) => {
        const isActive = selected === theme.id;
        const isDark = theme.mode === "dark";

        return (
            <button
                key={theme.id}
                className={`${styles.themeCard} ${isDark ? styles.darkCard : ""} ${
                    isActive ? styles.active : ""
                }`}
                onClick={() => setSelected(theme.id)}
            >
                {isActive && (
                    <div className={styles.checkBadge}>
                        <Check size={12} strokeWidth={3} />
                    </div>
                )}

                <div className={styles.preview}>
                    <div
                        className={styles.previewSidebar}
                        style={{ background: theme.sidebar }}
                    >
            <span
                className={styles.sidebarLine}
                style={{ background: "rgba(255,255,255,0.6)", width: "70%" }}
            />
                        <span
                            className={styles.sidebarLine}
                            style={{ background: "rgba(255,255,255,0.35)", width: "50%" }}
                        />
                        <span
                            className={styles.sidebarLine}
                            style={{ background: "rgba(255,255,255,0.35)", width: "60%" }}
                        />
                        <span
                            className={styles.sidebarLine}
                            style={{ background: "rgba(255,255,255,0.35)", width: "45%" }}
                        />
                    </div>
                    <div
                        className={styles.previewContent}
                        style={{
                            background: isDark ? theme.main : "#FFFFFF",
                        }}
                    >
                        <div className={styles.previewTopRow}>
                            <div
                                className={styles.previewBar}
                                style={{
                                    background: theme.main,
                                    width: "60%",
                                }}
                            />
                            <span
                                className={styles.previewAccent}
                                style={{ background: theme.indicators[0] }}
                            />
                        </div>
                        <div className={styles.previewLineGroup}>
              <span
                  className={styles.previewLine}
                  style={{
                      background: isDark
                          ? "rgba(255,255,255,0.18)"
                          : "var(--color-border)",
                      width: "85%",
                  }}
              />
                            <span
                                className={styles.previewLine}
                                style={{
                                    background: isDark
                                        ? "rgba(255,255,255,0.12)"
                                        : "var(--color-border)",
                                    width: "65%",
                                }}
                            />
                            <span
                                className={styles.previewLine}
                                style={{
                                    background: isDark
                                        ? "rgba(255,255,255,0.12)"
                                        : "var(--color-border)",
                                    width: "75%",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.cardFooter}>
                    <div className={styles.cardInfo}>
                        <span className={styles.cardName}>{theme.name}</span>
                        <span className={styles.cardSubtitle}>{theme.subtitle}</span>
                    </div>
                    <div className={styles.dots}>
                        {theme.indicators.map((color, idx) => (
                            <span
                                key={idx}
                                className={styles.dot}
                                style={{ background: color }}
                            />
                        ))}
                    </div>
                </div>
            </button>
        );
    };

    const currentTheme = THEMES.find((t) => t.id === selected);

    return (
        <Card
            maxWidth="100%"
            style={{
                width: "calc(100% - 32px)",
                margin: "0 16px 20px 16px",
            }}
        >
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <div className={styles.icon}>
                            <Palette size={18} />
                        </div>
                        <div>
                            <h3>Temas del sistema</h3>
                            <p>Apariencia visual del sistema para todos los usuarios</p>
                        </div>
                    </div>
                    <span className={styles.current}>{currentTheme.name}</span>
                </div>

                <div className={styles.section}>
                    <span className={styles.sectionLabel}>Temas claros</span>
                    <div className={styles.themesGrid}>
                        {lightThemes.map(renderThemeCard)}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabelRow}>
                        <span className={styles.sectionLabel}>Temas oscuros</span>
                        <span className={styles.badge}>Nuevo</span>
                    </div>
                    <div className={styles.themesGrid}>
                        {darkThemes.map(renderThemeCard)}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ThemeSettings;