import Header from "../../../design/components/Header/Header";
import Button from "../../../design/components/Button/Button";
import Card from "../../../design/components/Card/Card";

import styles from "../pages/Settings.module.css"

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
          size="small"
          onClick={handleDiscard}
          style={{
            width: "auto",
          }}
        >
          Descartar
        </Button>

        <Button
          variant="primary"
          size="small"
          onClick={handleSave}
          style={{
            width: "auto",
          }}
        >
          Guardar
        </Button>
        
        
      </Header>

      <div className={styles.content}>
        <Card>
          <div className={styles.placeholder}>
            Próximamente configuraciones del sistema
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;