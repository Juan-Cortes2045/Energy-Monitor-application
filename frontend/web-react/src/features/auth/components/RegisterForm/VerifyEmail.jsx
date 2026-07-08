import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import styles from "./VerifyAccount.module.css";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
  const { t } = useTranslation("auth");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

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

  const handleVerify = (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    console.log("Código:", finalCode);
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}
      style={{
        width: "400px",
      }}>
        <div className={styles.content}>
          <h2 className={styles.title}>{t("verify.title")}</h2>

          <p className={styles.description}>{t("verify.description")}</p>

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

          <Button variant="primary" onClick={handleVerify}>
            {t("verify.confirm")}
          </Button>

          <span className={styles.helperText}>{t("verify.notReceived")}</span>

          <Button type="button" variant="secondary">
            {t("verify.resend")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
