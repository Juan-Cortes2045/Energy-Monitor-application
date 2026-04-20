import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import styles from "./Account.module.css";
import typography from "../../design/tokens/typography";
import colors from "../../design/tokens/colors";
import radius from "../../design/tokens/radius";
import shadows from "../../design/tokens/shadows";
import ImportImg from "./ImportImg";

const Account = () => {
  return (
    <div
      className={styles.containerElements}
      style={{
        border: `1px solid ${colors.textSecondary}`,
        borderRadius: radius.lg,
        boxShadow: shadows.lg,
        background: colors.background,
        width: "600px",
      }}
    >
      <h2
        className={styles.title}
        style={{ fontFamily: typography.fontPrimary }}
      >
        Mi cuenta
      </h2>

      <div className={styles.avatarContainer}>
        <ImportImg />
      </div>

      <div className={styles.form}>
        <div
          className={styles.row}
          style={{
            background: colors.background,
            border: `1px solid ${colors.textSecondary}`,
            borderRadius: radius.sm,
            padding: "10px 12px",
          }}
        >
          <label style={{ fontFamily: typography.fontPrimary }}>Nombre</label>
          <p className={styles.text}>Usuario001</p>
          <Button variant="primary">Editar</Button>
        </div>

        <div
          className={styles.row}
          style={{
            background: colors.background,
            border: `1px solid ${colors.textSecondary}`,
            borderRadius: radius.sm,
            padding: "10px 12px",
          }}
        >
          <label style={{ fontFamily: typography.fontPrimary }}>Correo</label>
          <p className={styles.text}>Usuario001@email.com</p>
          <Button variant="primary">Cambiar</Button>
        </div>

        <div
          className={styles.row}
          style={{
            background: colors.background,
            border: `1px solid ${colors.textSecondary}`,
            borderRadius: radius.sm,
            padding: "10px 12px",
          }}
        >
          <label style={{ fontFamily: typography.fontPrimary }}>Teléfono</label>
          <p className={styles.text}>No tienes en el momento</p>
          <Button variant="primary">Vincular</Button>
        </div>

        <div
          className={styles.row}
          style={{
            background: colors.background,
            border: `1px solid ${colors.textSecondary}`,
            borderRadius: radius.sm,
            padding: "10px 12px",
          }}
        >
          <label style={{ fontFamily: typography.fontPrimary }}>
            Contraseña
          </label>
          <div></div>
          <Button variant="primary">Actualizar</Button>
        </div>
      </div>

      <div className={styles.deleteButton}>
        <p
          style={{
            fontFamily: typography.fontSecondary,
            fontWeight: typography.weights.bold,
          }}
        >
          ¿Deseas eliminar tu cuenta?
        </p>
        <div className={styles.width}>
          <Button
            variant="secondary"
            style={{
              color: colors.danger,
              marginTop: "6px",
            }}
          >
            Eliminar cuenta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Account;
