import Header from "../../../design/components/Header/Header";
import { useTranslation } from "react-i18next";
import styles from "../pages/Settings.module.css";

import LanguageSettings from "../components/LanguageSettings/LanguageSettings.jsx";
import ThemeSettings from "../components/ThemeSettings/ThemeSettings.jsx";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings.jsx";
import HelpCenter from "../components/HelpCenter/HelpCenter.jsx";

const Settings = () => {
  const { t } = useTranslation("settings");

  return (
    <div className={styles.page}>
      <Header
        breadcrumbItems={[
          { label: t("header.home"), path: "/dashboard" },
          { label: t("header.settings") },
        ]}
      />

      <LanguageSettings />
      <ThemeSettings />
      <NotificationSettings />
      <HelpCenter />
    </div>
  );
};

export default Settings;