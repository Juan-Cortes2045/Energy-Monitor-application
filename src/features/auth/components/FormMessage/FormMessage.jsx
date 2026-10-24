import styles from "./FormMessage.module.css";

/**
 * Mensajes de los formularios de auth con un solo estilo.
 * - Error de campo: `id` lo enlaza al input (aria-describedby); el lector lo lee al enfocarlo.
 * - Error del formulario (`alert`): se anuncia en cuanto aparece.
 * - Aviso (`tone="success"`): confirmación no urgente, se anuncia como estado.
 */
const FormMessage = ({ id, message, alert = false, tone = "error" }) => {
  if (!message) return null;

  const role = tone === "success" ? "status" : alert ? "alert" : undefined;

  return (
    <p id={id} role={role} className={tone === "success" ? styles.success : styles.error}>
      {message}
    </p>
  );
};

export default FormMessage;
