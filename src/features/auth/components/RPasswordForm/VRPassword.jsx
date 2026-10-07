import { useRef, useState } from "react";
import styles from "./VRPassword.module.css";
import { useTranslation } from "react-i18next";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import { codeSchema } from "../../validation/codeSchema.js";
import { forgotPassword } from "../../services/authApi.js";

const EMPTY = ["", "", "", "", "", ""];

// Paso 1: el usuario escribe el código de 6 dígitos. El backend solo lo valida
// al canjearlo junto con la contraseña nueva, así que aquí se comprueba el
// formato y se entrega el código al paso siguiente (solo en memoria).
const VRPassword = ({ email, initialError = "", onVerified }) => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const [error, setError] = useState(initialError);
  const [info, setInfo] = useState(initialError ? "" : t("neutralSent"));
  const { secondsLeft, isCoolingDown, start: startCooldown } = useResendCooldown();
  const [code, setCode] = useState(EMPTY);
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

  const handleResend = async () => {
    setCode(EMPTY);
    setError("");
    inputsRef.current[0]?.focus();
    try {
      await forgotPassword(email);
    } catch (e) {
      if (e.status === 429) {
        setInfo("");
        setError(t("rateLimited", { minutes: Math.ceil((e.retryAfter ?? 900) / 60) }));
        return;
      }
      // Cualquier otro fallo se oculta: no se distingue si la cuenta existe.
    }
    setInfo(t("neutralSent"));
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
    onVerified(finalCode);
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} style={{ width: "400px" }}>
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("verifyDescription")}</p>
        <p className={styles.description}>{t("expires")}</p>

        <form onSubmit={handleVerify}>
          <div className={styles.otpContainer}>
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                variant="otp"
              />
            ))}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {info && <p className={styles.success}>{info}</p>}
          <div className={styles.center}>
            <Button type="submit" variant="primary">
              {t("confirmCode")}
            </Button>

            <p className={styles.text}>{t("notReceived")}</p>

            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={isCoolingDown}
            >
              {isCoolingDown ? t("resendIn", { seconds: secondsLeft }) : t("resend")}
            </Button>
          </div>
        </form>
        <p className={styles.register}>
          {t("comeBack")}.{" "}
          <a
            href="/login"
            style={{ color: "var(--color-secondary)" }}
            className={styles.registerLink}
          >
            {t("login")}
          </a>
        </p>
      </Card>
    </div>
  );
};

export default VRPassword;
