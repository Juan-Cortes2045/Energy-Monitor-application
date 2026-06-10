import { Globe } from "lucide-react";
import { useState } from "react";
import ReactCountryFlag from "react-country-flag";

import Card from "../../../../design/components/Card/Card.jsx"

import styles from "./LanguageSettings.module.css";

const LANGUAGES = [
    {
        id: "es",
        name: "Español",
        locale: "es-CO",
        countryCode: "CO",
    },
    {
        id: "en",
        name: "English",
        locale: "en-US",
        countryCode: "US",
    },
    {
        id: "pt",
        name: "Português",
        locale: "pt-BR",
        countryCode: "BR",
    },
    {
        id: "fr",
        name: "Français",
        locale: "fr-FR",
        countryCode: "FR",
    },
];

const LanguageSettings = () => {
    const [selected, setSelected] = useState("es");

    const currentLanguage =
        LANGUAGES.find(
            (language) => language.id === selected
        );

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
                            <Globe size={18} />
                        </div>

                        <div>
                            <h3>Idioma del sistema</h3>

                            <p>
                                Define el idioma de la interfaz
                                y los reportes generados
                            </p>
                        </div>
                    </div>

                    <span className={styles.current}>
            {currentLanguage.name}
          </span>
                </div>

                <div className={styles.languages}>
                    {LANGUAGES.map((language) => (
                        <button
                            key={language.id}
                            className={`${styles.languageCard}
              ${
                                selected === language.id
                                    ? styles.active
                                    : ""
                            }`}
                            onClick={() =>
                                setSelected(language.id)
                            }
                        >
                            {selected === language.id && (
                                <div
                                    className={styles.check}
                                />
                            )}

                            <div className={styles.flag}>
                                <ReactCountryFlag
                                    countryCode={language.countryCode}
                                    svg
                                    aria-label={language.name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>

                            <h4>{language.name}</h4>

                            <span>
                {language.locale}
              </span>
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default LanguageSettings;