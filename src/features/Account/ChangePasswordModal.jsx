import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Input from "../../design/components/Input/Input";
import Button from "../../design/components/Button/Button";
import { changePasswordSchema } from "../auth/validation/resetSchema";
import { changePassword } from "../../services/auth/authApi";
import { errorMessage } from "../../services/http/errorMessages";
import { useDialogA11y } from "../../hooks/useDialogA11y";
import styles from "./Modal.module.css";

// Atributos de accesibilidad de un campo con su posible error debajo.
const fieldA11y = (id, error) => ({
  "aria-invalid": Boolean(error),
  "aria-describedby": error ? `${id}-error` : undefined,
});

// Contraseña actual + nueva. `onDone` se llama al cambiarla; `onClose` al cancelar.
const ChangePasswordModal = ({ onClose, onDone }) => {
  const { t } = useTranslation("account");
  const { t: v } = useTranslation("validations");
  const { t: tc } = useTranslation("common");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useDialogA11y(onClose);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema(v)) });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setError("");
    try {
      await changePassword({ currentPassword, newPassword });
      onDone();
    } catch (e) {
      setError(errorMessage(t, e, "passwordChange")); // 401: actual incorrecta; 422: política
    }
  };

  const type = show ? "text" : "password";

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className={styles.box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        tabIndex={-1}
      >
        <Card>
          <form className={styles.content} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 id="change-password-title" className={styles.title}>
              {t("changePassword.title")}
            </h2>

            <Input
              id="currentPassword"
              type={type}
              autoComplete="current-password"
              {...fieldA11y("currentPassword", errors.currentPassword)}
              {...register("currentPassword")}
            >
              {t("changePassword.current")}
            </Input>
            {errors.currentPassword && (
              <span id="currentPassword-error" className={styles.error} role="alert">
                {errors.currentPassword.message}
              </span>
            )}

            {/* El botón del ojo muestra u oculta las tres contraseñas a la vez. */}
            <Input
              id="newPassword"
              type={type}
              autoComplete="new-password"
              icon={show ? <EyeOff size={20} /> : <Eye size={20} />}
              onIconClick={() => setShow(!show)}
              iconLabel={tc(show ? "hidePassword" : "showPassword")}
              {...fieldA11y("newPassword", errors.newPassword)}
              {...register("newPassword")}
            >
              {t("changePassword.new")}
            </Input>
            {errors.newPassword && (
              <span id="newPassword-error" className={styles.error} role="alert">
                {errors.newPassword.message}
              </span>
            )}

            <Input
              id="repeatPassword"
              type={type}
              autoComplete="new-password"
              {...fieldA11y("repeatPassword", errors.repeatPassword)}
              {...register("repeatPassword")}
            >
              {t("changePassword.repeat")}
            </Input>
            {errors.repeatPassword && (
              <span id="repeatPassword-error" className={styles.error} role="alert">
                {errors.repeatPassword.message}
              </span>
            )}

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {t("changePassword.submit")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
