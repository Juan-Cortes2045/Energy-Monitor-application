import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";
import Card from "../../../design/components/Card/Card";

import styles from "../pages/Settings.module.css"

import LanguageSettings  from "../components/LanguageSettings/LanguageSettings.jsx"

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
    </div>
  );
};

export default Settings;