import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";
import { useTranslation } from "react-i18next";

import styles from "../pages/Settings.module.css";

import { useState } from "react";
import i18n from "../../../i18n";

import LanguageSettings from "../components/LanguageSettings/LanguageSettings.jsx";
import ThemeSettings from "../components/ThemeSettings/ThemeSettings.jsx";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings.jsx";
import HelpCenter from "../components/HelpCenter/HelpCenter.jsx";

import { Save, X } from "lucide-react";

const Settings = () => {
  const { t } = useTranslation("settings");
  const [language, setLanguage] = useState("es");

  const handleSave = () => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
    console.log("Guardar");
  };

  const handleDiscard = () => {
    console.log("Descartar");
  };

  return (
    <div className={styles.page}>
      <Header
        breadcrumbItems={[
          {
            label: t("header.home"),
            path: "/dashboard",
          },
          {
            label: t("header.settings"),
          },
        ]}
      >
        <Button
          variant="secondary"
          size="medium"
          onClick={handleDiscard}
          style={{
            width: "auto",
          }}
        >
          <span className={styles.desktopText}>{t("header.discard")}</span>

          <span className={styles.mobileIcon}>
            <X size={18} />
          </span>
        </Button>

        <Button
          variant="primary"
          size="medium"
          onClick={handleSave}
          style={{
            width: "auto",
          }}
        >
          <span className={styles.desktopText}>{t("header.save")}</span>

          <span className={styles.mobileIcon}>
            <Save size={18} />
          </span>
        </Button>
      </Header>

      <LanguageSettings language={language} setLanguage={setLanguage} />
      <ThemeSettings />
      <NotificationSettings />
      <HelpCenter />
    </div>
  );
};

export default Settings;
