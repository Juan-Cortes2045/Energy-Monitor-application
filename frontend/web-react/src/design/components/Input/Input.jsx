<<<<<<< HEAD
const Input = ({ value, type, placeholder, id, ...props }) => {
  return <input id={id} type={type} value={value} placeholder={placeholder} {...props} />;
=======
import styles from "../../css/Input.module.css";

const Input = ({ value, type, placeholder, id, children }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor={id}>
        {children}
      </label>

      <input
        className={styles.input}
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
>>>>>>> feature/System_base
};

export default Input;
