import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactCountryFlag from "react-country-flag";
import Card from "../../../../design/components/Card/Card.jsx";
import styles from "./LanguageSettings.module.css";
import i18n from "../../../../i18n";

const LANGUAGES = [
    { id: "es", name: "Español",   locale: "es-CO", countryCode: "CO" },
    { id: "en", name: "English",   locale: "en-US", countryCode: "US" },
    { id: "pt", name: "Português", locale: "pt-BR", countryCode: "BR" },
    { id: "fr", name: "Français",  locale: "fr-FR", countryCode: "FR" },
];

const LanguageSettings = () => {
  const { t } = useTranslation("settings");
  const currentId = i18n.language;
  const currentLanguage = LANGUAGES.find((lang) => lang.id === currentId) ?? LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("lang", code);
  };

  return (
    <Card
      maxWidth="100%"
      style={{ width: "calc(100% - 32px)", margin: "0 16px 20px 16px" }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.icon}>
              <Globe size={24} />
            </div>
            <div>
              <h3>{t("language.title")}</h3>
              <p>{t("language.description")}</p>
            </div>
          </div>
          <span className={styles.current}>{currentLanguage.name}</span>
        </div>

        <div className={styles.languages}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              className={`${styles.languageCard} ${currentId === lang.id ? styles.active : ""}`}
              onClick={() => handleSelect(lang.id)}
            >
              {currentId === lang.id && (
                <div className={styles.check}>
                  <Check size={12} strokeWidth={3} />
                </div>
              )}

              <div className={styles.flag}>
                <ReactCountryFlag
                  countryCode={lang.countryCode}
                  svg
                  aria-label={lang.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <h4>{lang.name}</h4>
              <span>{lang.locale}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default LanguageSettings;