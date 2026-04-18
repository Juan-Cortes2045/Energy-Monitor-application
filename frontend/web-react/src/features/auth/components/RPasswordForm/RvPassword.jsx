import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import styles from "./RecoverPassword.module.css";

import { useNavigate } from "react-router-dom";

const RvPassword = () => {
  const navigate = useNavigate();
  const onSubmit = () => {
    navigate("/VRPassword");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviar código");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2 className={styles.title}>Recuperar contraseña</h2>

        <p className={styles.description}>
          Te enviaremos un correo con código de verificación de 6 dígitos para
          poder recuperar tu cuenta. A continuación digita tu correo
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input id="email" type="email" placeholder="*">
              Correo Electrónico
            </Input>
          </div>

          <Button type="submit" onSubmit={onSubmit} className={styles.button}>
            Enviar código
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RvPassword;
