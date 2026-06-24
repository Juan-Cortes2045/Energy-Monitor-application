import { Palette, Check } from "lucide-react";
import Card from "../../../../design/components/Card/Card.jsx";
import styles from "./ThemeSettings.module.css";

const themes = {
  "energy-light": {
    "--color-primary": "#0078d7",
    "--color-primary-hover": "#3399ff",
    "--color-background": "#f8f9fa",
    "--color-surface": "#ffffff",
    "--color-text-primary": "#212529",
    "--color-text-secondary": "#6c757d",
    "--color-border": "#e5e7eb",
  },

  "eco-light": {
    "--color-primary": "#32cd32",
    "--color-primary-hover": "#2ecc71",
    "--color-background": "#f4fff4",
    "--color-surface": "#ffffff",
    "--color-text-primary": "#1b4332",
    "--color-text-secondary": "#52796f",
    "--color-border": "#d8f3dc",
  },

  "energy-dark": {
    "--color-primary": "#0078d7",
    "--color-background": "#0f172a",
    "--color-surface": "#1e293b",
    "--color-text-primary": "#f8fafc",
    "--color-text-secondary": "#94a3b8",
    "--color-border": "#334155",
  },

  "eco-dark": {
    "--color-primary": "#32cd32",
    "--color-background": "#102a1a",
    "--color-surface": "#183321",
    "--color-text-primary": "#f0fff4",
    "--color-text-secondary": "#a7c4a0",
    "--color-border": "#29523b",
  },
};

const lightThemes = THEMES.filter((t) => t.mode === "light");
const darkThemes = THEMES.filter((t) => t.mode === "dark");

const ThemeSettings = ({
    value,
    onChange
}) => {

    const renderThemeCard = (theme) => {
        const isActive = value === theme.id;
        const isDark = theme.mode === "dark";

        return (
            <button
                key={theme.id}
                className={`${styles.themeCard} ${isDark ? styles.darkCard : ""} ${
                    isActive ? styles.active : ""
                }`}
                onClick={() => onChange(theme.id)}
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

    const currentTheme = THEMES.find((t) => t.id === value);

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
                            <Palette size={24} />
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