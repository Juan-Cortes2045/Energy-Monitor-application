import styles from "../../css/Card.module.css";

const Card = ({ title, children, style = {}, maxWidth = "100%" }) => {
  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-md)",
        padding: "var(--spacing-lg)",
        boxShadow: "var(--shadow-lg)",
        maxWidth,
        ...style,
      }}
    >
      {title && (
        <h3
          className={styles.title}
          style={{
            fontFamily: "var(--font-primary)",
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-text-primary)",
          }}
        >
          {title}
        </h3>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
