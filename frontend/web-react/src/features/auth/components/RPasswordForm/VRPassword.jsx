import { useState, useRef } from "react";
import styles from "./VRPassword.module.css";

import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";

const VRPassword = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const finalCode = code.join("");
    console.log("Código:", finalCode);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <h2 className={styles.title}>Recuperar contraseña</h2>

        <p className={styles.description}>
          Te enviamos un correo con un código de verificación de 6 dígitos para
          confirmar tu identidad
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

        <Button onClick={handleVerify} className={styles.confirmButton}>
          Confirmar código
        </Button>

        <p className={styles.text}>¿No te llegó el código?</p>

        <Button className={styles.resendButton}>Reenviar código</Button>
      </Card>
    </div>
  );
};

export default VRPassword;
