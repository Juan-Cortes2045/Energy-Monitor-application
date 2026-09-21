import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import { codeSchema } from "../../validation/codeSchema.js";
import styles from "./VerifyAccount.module.css";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
  const { t } = useTranslation("auth");
  const { t: v } = useTranslation("validations");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { secondsLeft, isCoolingDown, start: startCooldown } = useResendCooldown();
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


  const handleResend = () => {
    // TODO backend: aquí irá la llamada real de reenvío. Hoy no se envía nada.
    setCode(["", "", "", "", "", ""]);
    setError("");
    setInfo(t("verify.resendSent"));
    inputsRef.current[0]?.focus();
    startCooldown();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    const result = codeSchema(v).safeParse(finalCode);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    console.log("Código:", finalCode);
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        style={{
          width: "400px",
        }}
      >
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

          {error && <p className={styles.error}>{error}</p>}
          {info && <p className={styles.success}>{info}</p>}

          <Button variant="primary" onClick={handleVerify}>
            {t("verify.confirm")}
          </Button>

          <span className={styles.helperText}>{t("verify.notReceived")}</span>

          <Button
            type="button"
            variant="secondary"
            onClick={handleResend}
            disabled={isCoolingDown}
          >
            {isCoolingDown
              ? t("verify.resendIn", { seconds: secondsLeft })
              : t("verify.resend")}
          </Button>
          <p className={styles.register}>
            {t("register.haveAccount")}.{" "}
            <a
              href="/login"
              style={{ color: "var(--color-secondary)" }}
              className={styles.registerLink}
            >
              {t("register.login")}
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
