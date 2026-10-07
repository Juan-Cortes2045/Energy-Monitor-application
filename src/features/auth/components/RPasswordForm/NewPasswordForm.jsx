import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./VRPassword.module.css";
import Card from "../../../../design/components/Card/Card";
import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { newPasswordSchema } from "../../validation/resetSchema.js";
import { resetPassword } from "../../services/authApi.js";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";

// Paso 2: contraseña nueva. Canjea correo + código + contraseña en una sola llamada.
// `onDone` = éxito; `onCodeRejected` = el backend no aceptó el código (volver al paso 1).
const NewPasswordForm = ({ email, code, onDone, onCodeRejected }) => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const block = useResendCooldown(); // espera pedida por el servidor (429)

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(newPasswordSchema(v)) });

  const onSubmit = async ({ newPassword }) => {
    setError("");
    try {
      await resetPassword({ email, resetToken: code, newPassword });
      onDone();
      return;
    } catch (e) {
      if (e.status === 429) {
        const wait = e.retryAfter ?? 900;
        block.start(wait);
        setError(t("rateLimited", { minutes: Math.ceil(wait / 60) }));
      } else if (e.status === 422) {
        setError(e.message); // política de contraseña, mensaje del backend
      } else if (e.status === 400) {
        onCodeRejected(); // inválido, vencido o intentos agotados: indistinguible
        return;
      } else {
        setError(t("genericError"));
      }
    }
    resetField("newPassword", { defaultValue: "" });
    resetField("repeatPassword", { defaultValue: "" });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} style={{ width: "400px" }}>
        <h2 className={styles.title}>{t("newPassword")}</h2>
        <p className={styles.description}>{t("newPasswordDescription")}</p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}
        >
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="*"
            icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onIconClick={() => setShowPassword(!showPassword)}
            {...register("newPassword")}
          >
            {t("newPassword")}
          </Input>
          {errors.newPassword && (
            <span className={styles.error}>{errors.newPassword.message}</span>
          )}

          <Input
            id="repeatPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="*"
            {...register("repeatPassword")}
          >
            {t("repeatPassword")}
          </Input>
          {errors.repeatPassword && (
            <span className={styles.error}>{errors.repeatPassword.message}</span>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.center}>
            <Button type="submit" variant="primary" disabled={isSubmitting || block.isCoolingDown}>
              {block.isCoolingDown
                ? t("resendIn", { seconds: block.secondsLeft })
                : t("resetSubmit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewPasswordForm;
