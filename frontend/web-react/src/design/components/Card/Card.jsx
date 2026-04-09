import { styles } from "./card.styles";

const Card = ({ title, children }) => {
  return (
    <div style={styles.container}>
      {title && <h3 style={styles.title}>{title}</h3>}

      <div style={styles.content}>{children}</div>
    </div>
  );
};

export default Card;
