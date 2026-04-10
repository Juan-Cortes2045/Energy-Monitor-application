import styles from "../../css/EmptyState.module.css";
import Button from "../Button/Button";

const EmptyState = ({
  title = "Sin datos",
  description = "No hay información disponible",
  actionText,
  onAction,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>📊</div>

      <h3 className={styles.title}>{title}</h3>

      <p className={styles.description}>{description}</p>

      {actionText && <Button onClick={onAction}>{actionText}</Button>}
    </div>
  );
};

export default EmptyState;
