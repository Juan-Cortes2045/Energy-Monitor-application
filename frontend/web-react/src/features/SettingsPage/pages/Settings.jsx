import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";

import styles from "../pages/Settings.module.css";

import LanguageSettings from "../components/LanguageSettings/LanguageSettings.jsx";
import ThemeSettings from "../components/ThemeSettings/ThemeSettings.jsx";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings.jsx";
import HelpCenter from "../components/HelpCenter/HelpCenter.jsx";

import { Save, X } from "lucide-react";

const Settings = () => {
  const handleSave = () => {
    console.log("Guardar");
  };

  const handleDiscard = () => {
    console.log("Descartar");
  };

  return (
    <div className={styles.page}>
      <Header
        breadcrumbItems={[
          { label: "Inicio", path: "/dashboard" },
          { label: "Ajustes" },
        ]}
      >
        <Button variant="secondary" size="medium" onClick={handleDiscard} style={{ width: "auto" }}>
          <span className={styles.desktopText}>Descartar</span>
          <span className={styles.mobileIcon}><X size={18} /></span>
        </Button>

        <Button variant="primary" size="medium" onClick={handleSave} style={{ width: "auto" }}>
          <span className={styles.desktopText}>Guardar</span>
          <span className={styles.mobileIcon}><Save size={18} /></span>
        </Button>
      </Header>

      <LanguageSettings />
      <ThemeSettings />
      <NotificationSettings />
      <HelpCenter />
    </div>
  );
};

export default Settings;