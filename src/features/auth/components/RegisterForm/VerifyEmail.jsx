import { useState, useRef } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import { codeSchema } from "../../validation/codeSchema.js";
import { resendVerification, verifyEmail } from "../../services/authApi";
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
  // Llega desde el registro; sin correo no hay nada que verificar.
  const email = useLocation().state?.email;
  const [submitting, setSubmitting] = useState(false);

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


  if (!email) return <Navigate to="/register" replace />;

  const showRequestError = (e) => {
    if (e.status === 429) {
      setError(t("verify.rateLimited", { minutes: Math.ceil((e.retryAfter ?? 900) / 60) }));
    } else if (e.status === 400) {
      setError(t("verify.codeRejected")); // inválido o vencido: indistinguible
    } else {
      setError(t("verify.genericError"));
    }
  };

  const handleResend = async () => {
    setCode(["", "", "", "", "", ""]);
    setError("");
    setInfo("");
    inputsRef.current[0]?.focus();
    try {
      await resendVerification(email);
      setInfo(t("verify.resendSent"));
      startCooldown();
    } catch (e) {
      showRequestError(e);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    const result = codeSchema(v).safeParse(finalCode);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      await verifyEmail({ email, code: finalCode });
      navigate("/login", { replace: true, state: { notice: "verified" } });
    } catch (err) {
      showRequestError(err);
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
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

          <Button variant="primary" onClick={handleVerify} disabled={submitting}>
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
