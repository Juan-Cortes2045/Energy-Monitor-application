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
import { resetPassword } from "../../../../services/auth/authApi";
import { errorMessage } from "../../../../services/http/errorMessages";
import { useResendCooldown } from "../../hooks/useResendCooldown.js";
import FormMessage from "../FormMessage/FormMessage";
import { errorId, fieldA11y } from "../FormMessage/fieldA11y.js";

const PASSWORD_HINT_ID = "newPassword-hint";

// Paso 2: contraseña nueva. Canjea correo + código + contraseña en una sola llamada.
// `onDone` = éxito; `onCodeRejected` = el backend no aceptó el código (volver al paso 1).
const NewPasswordForm = ({ email, code, onDone, onCodeRejected }) => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const { t: tc } = useTranslation("common");
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
      } else if (e.status === 400) {
        onCodeRejected(); // inválido, vencido o intentos agotados: indistinguible
        return;
      } else {
        setError(errorMessage(t, e, "passwordReset")); // 422: política de contraseña
      }
    }
    resetField("newPassword", { defaultValue: "" });
    resetField("repeatPassword", { defaultValue: "" });
  };

  return (
    <div className={styles.container}>
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className={styles.title}>{t("newPassword")}</h1>
        <p className={styles.description}>{t("newPasswordDescription")}</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
          {/* Un solo botón muestra/oculta ambas contraseñas */}
          <Input
            id="newPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onIconClick={() => setShowPassword(!showPassword)}
            iconLabel={tc(showPassword ? "hidePassword" : "showPassword")}
            {...fieldA11y("newPassword", errors.newPassword, PASSWORD_HINT_ID)}
            {...register("newPassword")}
          >
            {t("newPassword")}
          </Input>
          <p id={PASSWORD_HINT_ID} className={styles.hint}>
            {t("passwordHint")}
          </p>
          <FormMessage id={errorId("newPassword")} message={errors.newPassword?.message} />

          <Input
            id="repeatPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...fieldA11y("repeatPassword", errors.repeatPassword)}
            {...register("repeatPassword")}
          >
            {t("repeatPassword")}
          </Input>
          <FormMessage
            id={errorId("repeatPassword")}
            message={errors.repeatPassword?.message}
          />

          <FormMessage message={error} alert />

          <div className={styles.center}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || block.isCoolingDown}
              aria-busy={isSubmitting}
            >
              {block.isCoolingDown
                ? t("resendIn", { seconds: block.secondsLeft })
                : isSubmitting
                  ? tc("loading")
                  : t("resetSubmit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewPasswordForm;
