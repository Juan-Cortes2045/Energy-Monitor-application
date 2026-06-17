import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";

import styles from "../pages/Settings.module.css"

import LanguageSettings  from "../components/LanguageSettings/LanguageSettings.jsx"
import ThemeSettings from "../components/ThemeSettings/ThemeSettings.jsx";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings.jsx";

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
          Descartar
        </Button>

        <Button
          variant="primary"
          size="medium"
          onClick={handleSave}
          style={{
            width: "auto",
          }}
        >
          Guardar
        </Button>
        
        
      </Header>

        <LanguageSettings />
        <ThemeSettings />

        <NotificationSettings/>

    </div>
  );
};

export default Settings;