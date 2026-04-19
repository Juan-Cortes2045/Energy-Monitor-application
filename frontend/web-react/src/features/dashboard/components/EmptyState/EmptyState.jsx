import styles from "../EmptyState/EmptyState.module.css";
import emptyImg from "../../../../assets/empty_image.png"

import Button from "../../../../design/components/Button/Button";

import colors from "../../../../design/tokens/colors";
import spacing from "../../../../design/tokens/spacing";
import typography from "../../../../design/tokens/typography";

const EmptyState = () => {
  return (
    <div className={styles.container}>
      <img className={styles.emptyImg} src={emptyImg} alt="empty" />

      <h2 style={{
        color: colors.textSecondary,
        fontFamily: typography.fontSecondary,
        fontWeight: typography.weights.bold,
        fontSize: typography.sizes.xl,
      }}
        >
          Añade un proyecto para empezar
        </h2>
      
      <div 
      className={styles.buttonsContainer}
      style={{
        marginTop: spacing.md,
        gap: spacing.sm,
      }}
      >
      <Button variant="secondary">Crear Proyecto</Button>
      <Button variant="primary">Ingresar a Proyecto</Button>
      </div>
    </div>
  );
};

export default EmptyState;
