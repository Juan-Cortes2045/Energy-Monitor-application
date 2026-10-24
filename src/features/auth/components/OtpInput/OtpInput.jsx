import { useTranslation } from "react-i18next";
import Input from "../../../../design/components/Input/Input";
import styles from "./OtpInput.module.css";

export const OTP_LENGTH = 6;

/**
 * Casillas del código de verificación (un dígito por casilla), compartidas por la
 * verificación de correo y la recuperación de contraseña.
 *
 * @param {string[]} value dígitos actuales (OTP_LENGTH posiciones)
 * @param {(code: string[]) => void} onChange recibe el código completo actualizado
 * @param {{ current: HTMLInputElement[] }} inputsRef el padre lo usa para devolver el foco
 * @param {string} label nombre accesible del grupo ("Código de 6 dígitos")
 * @param {string} [errorId] id del mensaje de error, si lo hay
 */
const OtpInput = ({ value, onChange, inputsRef, label, errorId }) => {
  const { t } = useTranslation("auth");

  const focusAt = (index) => inputsRef.current[index]?.focus();

  const handleChange = (digit, index) => {
    if (!/^[0-9]?$/.test(digit)) return;

    const next = [...value];
    next[index] = digit;
    onChange(next);

    if (digit && index < OTP_LENGTH - 1) focusAt(index + 1);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) focusAt(index - 1);
  };

  // Pegar el código completo (lo habitual al copiarlo del correo) llena las casillas
  // desde la actual en vez de descartarlo por el maxLength de 1.
  const handlePaste = (e, index) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();

    const next = [...value];
    [...digits.slice(0, OTP_LENGTH - index)].forEach((d, i) => {
      next[index + i] = d;
    });
    onChange(next);
    focusAt(Math.min(index + digits.length, OTP_LENGTH - 1));
  };

  return (
    <div className={styles.otpContainer} role="group" aria-label={label}>
      {value.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          maxLength={1}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={t("otp.digit", { index: index + 1, total: OTP_LENGTH })}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          variant="otp"
        />
      ))}
    </div>
  );
};

export default OtpInput;
