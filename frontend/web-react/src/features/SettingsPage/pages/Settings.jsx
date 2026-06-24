import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";

import styles from "../pages/Settings.module.css";

import LanguageSettings from "../components/LanguageSettings/LanguageSettings.jsx";
import ThemeSettings from "../components/ThemeSettings/ThemeSettings.jsx";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings.jsx";
import HelpCenter from "../components/HelpCenter/HelpCenter.jsx";

import { useEffect } from "react";

import {
  Save,
  X
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    language: "es",
    theme: "energy-light",
    notifications: {
      email: true,
      push: false,
    },
  });

  const handleSave = () => {
    console.log("Guardar");
  };

  const handleDiscard = () => {
    console.log("Descartar");
  };

  useEffect(() => {
    const theme = themes[settings.theme];

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [settings.theme]);

  return (
    <div className={styles.page}>
      <Header
        breadcrumbItems={[
          {
            label: "Inicio",
            path: "/dashboard",
          },
          {
            label: "Ajustes",
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
          <span className={styles.desktopText}>
            Descartar
          </span>

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
          <span className={styles.desktopText}>
            Guardar
          </span>

          <span className={styles.mobileIcon}>
            <Save size={18} />
          </span>
        </Button>
      </Header>

      <LanguageSettings
        value={settings.language}
        onChange={(language) =>
          setSettings({
            ...settings,
            language,
          })
        }
      />
      <ThemeSettings 
        value={settings.theme}
        onChange={(theme)=>
          setSettings({
            ...settings,
            theme,
          })
        }
      />
      <NotificationSettings />
      <HelpCenter />
    </div>
  );
};

export default Settings;