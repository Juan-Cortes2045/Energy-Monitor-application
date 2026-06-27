import { Palette, Check } from "lucide-react";
import Card from "../../../../design/components/Card/Card.jsx";
import { useTheme } from "../../../../context/ThemeContext.jsx";
import styles from "./ThemeSettings.module.css";

const lightThemes = (themes) => themes.filter((t) => t.mode === "light");
const darkThemes  = (themes) => themes.filter((t) => t.mode === "dark");

const ThemeSettings = () => {
    const { themeId, setThemeId, currentTheme, themes } = useTheme();

    const renderThemeCard = (theme) => {
        const isActive = themeId === theme.id;
        const isDark   = theme.mode === "dark";

        return (
            <button
                key={theme.id}
                className={`${styles.themeCard} ${isDark ? styles.darkCard : ""} ${
                    isActive ? styles.active : ""
                }`}
                onClick={() => setThemeId(theme.id)}   
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
                        <span className={styles.sidebarLine} style={{ background: "rgba(255,255,255,0.6)",  width: "70%" }} />
                        <span className={styles.sidebarLine} style={{ background: "rgba(255,255,255,0.35)", width: "50%" }} />
                        <span className={styles.sidebarLine} style={{ background: "rgba(255,255,255,0.35)", width: "60%" }} />
                        <span className={styles.sidebarLine} style={{ background: "rgba(255,255,255,0.35)", width: "45%" }} />
                    </div>
                    <div
                        className={styles.previewContent}
                        style={{ background: isDark ? theme.main : "#FFFFFF" }}
                    >
                        <div className={styles.previewTopRow}>
                            <div
                                className={styles.previewBar}
                                style={{ background: theme.main, width: "60%" }}
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
                                    background: isDark ? "rgba(255,255,255,0.18)" : "var(--color-border)",
                                    width: "85%",
                                }}
                            />
                            <span
                                className={styles.previewLine}
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.12)" : "var(--color-border)",
                                    width: "65%",
                                }}
                            />
                            <span
                                className={styles.previewLine}
                                style={{
                                    background: isDark ? "rgba(255,255,255,0.12)" : "var(--color-border)",
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
                        {lightThemes(themes).map(renderThemeCard)}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionLabelRow}>
                        <span className={styles.sectionLabel}>Temas oscuros</span>
                    </div>
                    <div className={styles.themesGrid}>
                        {darkThemes(themes).map(renderThemeCard)}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ThemeSettings;