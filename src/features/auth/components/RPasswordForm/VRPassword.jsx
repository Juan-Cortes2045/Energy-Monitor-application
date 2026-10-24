import { errorMessage } from "../../../../services/http/errorMessages";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./VRPassword.module.css";
import { useTranslation } from "react-i18next";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import OtpInput, { OTP_LENGTH } from "../OtpInput/OtpInput";
import FormMessage from "../FormMessage/FormMessage";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import { codeSchema } from "../../validation/codeSchema.js";
import { forgotPassword } from "../../../../services/auth/authApi";

const EMPTY = Array(OTP_LENGTH).fill("");
const CODE_ERROR_ID = "recover-code-error";

// Paso 1: el usuario escribe el código de 6 dígitos. El backend solo lo valida
// al canjearlo junto con la contraseña nueva, así que aquí se comprueba el
// formato y se entrega el código al paso siguiente (solo en memoria).
const VRPassword = ({ email, initialError = "", onVerified }) => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const [error, setError] = useState(initialError);
  const [info, setInfo] = useState(initialError ? "" : t("codeSent"));
  const { secondsLeft, isCoolingDown, start: startCooldown } = useResendCooldown();
  const [code, setCode] = useState(EMPTY);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  const handleResend = async () => {
    setCode(EMPTY);
    setError("");
    inputsRef.current[0]?.focus();
    setResending(true);
    try {
      await forgotPassword(email);
    } catch (e) {
      if (e.status === 429) {
        setInfo("");
        setError(t("rateLimited", { minutes: Math.ceil((e.retryAfter ?? 900) / 60) }));
        return;
      }
      setInfo("");
      setError(errorMessage(t, e, "passwordRecovery"));
      return;
    } finally {
      setResending(false);
    }
    setInfo(t("codeSent"));
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
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className={styles.title}>{t("title")}</h1>

        <p className={styles.description}>{t("verifyDescription")}</p>
        <p className={styles.description}>{t("expires")}</p>

        <form onSubmit={handleVerify} noValidate>
          <div className={styles.otpWrapper}>
            <OtpInput
              value={code}
              onChange={setCode}
              inputsRef={inputsRef}
              label={t("codeLabel")}
              errorId={error ? CODE_ERROR_ID : undefined}
            />
          </div>
          <div className={styles.center}>
            <FormMessage id={CODE_ERROR_ID} message={error} alert />
            <FormMessage message={info} tone="success" />

            <Button type="submit" variant="primary">
              {t("confirmCode")}
            </Button>

            <p className={styles.text}>{t("notReceived")}</p>

            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={isCoolingDown || resending}
              aria-busy={resending}
            >
              {isCoolingDown ? t("resendIn", { seconds: secondsLeft }) : t("resend")}
            </Button>
          </div>
        </form>
        <p className={styles.register}>
          <Link to="/login" className={styles.registerLink}>
            {t("backToLogin")}
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default VRPassword;
