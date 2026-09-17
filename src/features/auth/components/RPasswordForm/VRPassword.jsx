import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./VRPassword.module.css";
import { useTranslation } from "react-i18next";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { Eye, EyeOff } from "lucide-react";
import { recoverPassword, resetPassword } from "../../../../services/auth.service";

const VRPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [mockCode, setMockCode] = useState(location.state?.mockCode);

  const handleResend = async () => {
    if (!email) return;
    const { resetToken } = await recoverPassword({ email });
    setMockCode(resetToken);
  };

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

  const handleVerify = async () => {
    setFieldError(null);
    const finalCode = code.join("");
    if (finalCode.length !== 6) {
      setFieldError(v("errors.required"));
      return;
    }
    if (newPassword.length < 8) {
      setFieldError(v("errors.passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError(v("errors.passwordMatch"));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({ token: finalCode, password: newPassword });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setFieldError(err.code === "TOKEN_EXPIRED" || err.code === "TOKEN_USED" || err.code === "INVALID_TOKEN" ? t("invalidCode") : t("errors.generic", { defaultValue: v("errors.required") }));
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
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("verifyDescription")}</p>
        {mockCode && <p className={styles.text}>{t("mockCodeHint", { code: mockCode })}</p>}

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

        <Input
          id="newPassword"
          type={showPassword ? "text" : "password"}
          placeholder="*"
          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onIconClick={() => setShowPassword(!showPassword)}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        >
          {t("newPasswordLabel")}
        </Input>

        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="*"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        >
          {t("confirmPasswordLabel")}
        </Input>

        {fieldError && <span className={styles.text}>{fieldError}</span>}

        <div className={styles.center}>
          <Button onClick={handleVerify} variant="primary" disabled={submitting}>
            {t("confirmCode")}
          </Button>

          <p className={styles.text}>{t("notReceived")}</p>

          <Button variant="secondary" onClick={handleResend} disabled={!email}>
            {t("resend")}
          </Button>
        </div>
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
