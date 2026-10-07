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
import styles from "./Modal.module.css";

// Contraseña actual + nueva. `onDone` se llama al cambiarla; `onClose` al cancelar.
const ChangePasswordModal = ({ onClose, onDone }) => {
  const { t } = useTranslation("account");
  const { t: v } = useTranslation("validations");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

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
      <div className={styles.box}>
        <Card>
          <form className={styles.content} onSubmit={handleSubmit(onSubmit)} noValidate>
            <h2 className={styles.title}>{t("changePassword.title")}</h2>

            <Input
              id="currentPassword"
              type={type}
              autoComplete="current-password"
              placeholder="*"
              {...register("currentPassword")}
            >
              {t("changePassword.current")}
            </Input>
            {errors.currentPassword && (
              <span className={styles.error}>{errors.currentPassword.message}</span>
            )}

            <Input
              id="newPassword"
              type={type}
              autoComplete="new-password"
              placeholder="*"
              icon={show ? <EyeOff size={20} /> : <Eye size={20} />}
              onIconClick={() => setShow(!show)}
              {...register("newPassword")}
            >
              {t("changePassword.new")}
            </Input>
            {errors.newPassword && (
              <span className={styles.error}>{errors.newPassword.message}</span>
            )}

            <Input
              id="repeatPassword"
              type={type}
              autoComplete="new-password"
              placeholder="*"
              {...register("repeatPassword")}
            >
              {t("changePassword.repeat")}
            </Input>
            {errors.repeatPassword && (
              <span className={styles.error}>{errors.repeatPassword.message}</span>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
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
