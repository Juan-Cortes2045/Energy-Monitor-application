import { useEffect, useState, useRef } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import OtpInput, { OTP_LENGTH } from "../OtpInput/OtpInput";
import FormMessage from "../FormMessage/FormMessage";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import { codeSchema } from "../../validation/codeSchema.js";
import { resendVerification, verifyEmail } from "../../../../services/auth/authApi";
import styles from "./VerifyAccount.module.css";
import { useTranslation } from "react-i18next";

const EMPTY = Array(OTP_LENGTH).fill("");
const CODE_ERROR_ID = "verify-code-error";

const VerifyEmail = () => {
  const { t } = useTranslation("auth");
  const { t: v } = useTranslation("validations");
  const { t: tc } = useTranslation("common");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const { secondsLeft, isCoolingDown, start: startCooldown } = useResendCooldown();
  const [code, setCode] = useState(EMPTY);
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  // Llega desde el registro, o desde el login de una cuenta sin verificar (reason "unverified",
  // con o sin un código recién enviado); sin correo no hay nada que verificar.
  const { email, reason, codeSent } = useLocation().state ?? {};
  const unverifiedNotice =
    reason === "unverified"
      ? t(codeSent ? "verify.unverifiedSent" : "verify.unverifiedNotSent", {
          email,
          resend: t("verify.resend"),
        })
      : "";
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // El login acaba de enviar un código: el reenvío espera como si se hubiera pulsado.
  useEffect(() => {
    if (reason === "unverified" && codeSent) startCooldown();
  }, [reason, codeSent, startCooldown]);

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
    setCode(EMPTY);
    setError("");
    setInfo("");
    inputsRef.current[0]?.focus();
    setResending(true);
    try {
      await resendVerification(email);
      setInfo(t("verify.resendSent"));
      startCooldown();
    } catch (e) {
      showRequestError(e);
    } finally {
      setResending(false);
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
      navigate("/login", { replace: true, state: { notice: "verified", email } });
    } catch (err) {
      showRequestError(err);
      setCode(EMPTY);
      inputsRef.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t("verify.title")}</h1>

          {unverifiedNotice ? (
            <p className={styles.description} role="status">{unverifiedNotice}</p>
          ) : (
            <p className={styles.description}>{t("verify.description")}</p>
          )}

          {/* form: Enter en cualquier casilla confirma el código */}
          <form className={styles.form} onSubmit={handleVerify} noValidate>
            <OtpInput
              value={code}
              onChange={setCode}
              inputsRef={inputsRef}
              label={t("verify.codeLabel")}
              errorId={error ? CODE_ERROR_ID : undefined}
            />

            <FormMessage id={CODE_ERROR_ID} message={error} alert />
            <FormMessage message={info} tone="success" />

            <Button
              type="submit"
              variant="primary"
              disabled={submitting || resending}
              aria-busy={submitting}
            >
              {submitting ? tc("loading") : t("verify.confirm")}
            </Button>
          </form>

          <span className={styles.helperText}>{t("verify.notReceived")}</span>

          <Button
            type="button"
            variant="secondary"
            onClick={handleResend}
            disabled={isCoolingDown || resending || submitting}
            aria-busy={resending}
          >
            {isCoolingDown
              ? t("verify.resendIn", { seconds: secondsLeft })
              : t("verify.resend")}
          </Button>
          <p className={styles.register}>
            {t("register.haveAccount")}{" "}
            <Link to="/login" className={styles.registerLink}>
              {t("register.login")}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
