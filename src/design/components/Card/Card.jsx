import styles from "../../css/Card.module.css";

/**
 * Tarjeta del sistema de diseño. className se suma a la clase base (y puede cambiar fondo, padding
 * o sombra, definidos en Card.module.css); el resto de props llega al <div>.
 */
const Card = ({ title, children, style = {}, maxWidth = "100%", className = "", ...rest }) => {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={{ maxWidth, ...style }}
      {...rest}
    >
      {title && (
        <h3 className={styles.title}>
          {title}
        </h3>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
