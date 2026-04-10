import styles from "../../css/Card.module.css";

const Card = ({ title, children }) => {
  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
