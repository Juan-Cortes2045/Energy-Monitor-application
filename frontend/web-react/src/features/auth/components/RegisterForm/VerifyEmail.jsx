import { useState, useRef } from "react";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import styles from "./VerifyAccount.module.css";
import BackButton from "../BackButton/BackButton";

const VerifyEmail = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const finalCode = code.join("");
    console.log("Código:", finalCode);
  };

  return (
    <div className={styles.container}>
      <Card>
        <BackButton />
        <div className={styles.content}>
          <h2 className={styles.title}>Verificar correo</h2>

          <p className={styles.description}>
            Te enviamos un código de 6 dígitos a tu correo. Ingresa el código
            para verificar tu cuenta.
          </p>

          <div className={styles.otpContainer}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className={styles.input}
              />
            ))}
          </div>

          <Button variant="primary" onClick={handleVerify}>
            Confirmar código
          </Button>

          <span className={styles.helperText}>¿No te llegó el código?</span>

          <Button
            typr="Button"
            variant="secondary"
            className={styles.secondaryButton}
          >
            Reenviar código
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
