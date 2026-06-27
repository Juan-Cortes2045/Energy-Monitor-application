import styles from "../EmptyState/EmptyState.module.css";
import emptyImg from "../../../../assets/empty_image.png";

import Button from "../../../../design/components/Button/Button";

const EmptyState = ({ onCreateProject, onJoinProject }) => {
  return (
    <div className={styles.container}>
      <img className={styles.emptyImg} src={emptyImg} alt="empty" />

      <h2 className={styles.title}>
        Añade un proyecto para empezar
      </h2>

      <div className={styles.buttonsContainer}>
        <Button variant="secondary" onClick={onCreateProject}>
          Crear Proyecto
        </Button>
        <Button variant="primary" onClick={onJoinProject}>
          Ingresar a Proyecto
        </Button>
      </div>
    </div>
  );
};

export default EmptyState;