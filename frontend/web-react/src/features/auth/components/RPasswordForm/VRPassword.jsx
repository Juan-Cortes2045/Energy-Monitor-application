import { useState, useRef } from "react";
import styles from "./VRPassword.module.css";
import { useTranslation } from "react-i18next";

import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";

const VRPassword = () => {
  const { t } = useTranslation("recoverPassword");
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
      <Card
        className={styles.card}
        style={{
          width: "400px",
        }}
      >
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("verifyDescription")}</p>

        <div className={styles.otpContainer}>
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              variant="otp"
            />
          ))}
        </div>
        <div className={styles.center}>
          <Button onClick={handleVerify} variant="primary">
            {t("confirmCode")}
          </Button>

          <p className={styles.text}>{t("notReceived")}</p>

          <Button variant="secondary">{t("resend")}</Button>
        </div>
      </Card>
    </div>
  );
};

export default VRPassword;
