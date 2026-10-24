import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import FormMessage from "../FormMessage/FormMessage";
import { errorId, fieldA11y } from "../FormMessage/fieldA11y.js";
import styles from "./RecoverPassword.module.css";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "../../../../services/auth/authApi";
import { errorMessage } from "../../../../services/http/errorMessages";
import { recoverSchema } from "../../validation/recoverSchema.js";

const RvPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(recoverSchema(v)) });

  const [waitMinutes, setWaitMinutes] = useState(0);
  const [serverError, setServerError] = useState("");

  const onSubmit = async ({ email }) => {
    setWaitMinutes(0);
    setServerError("");
    try {
      await forgotPassword(email);
    } catch (e) {
      if (e.status === 429) return setWaitMinutes(Math.ceil((e.retryAfter ?? 900) / 60));
      // 404: el correo no tiene cuenta; se dice para que la persona pruebe con otro.
      return setServerError(errorMessage(t, e, "passwordRecovery"));
    }
    navigate("/verifyRecoverPassword", { state: { email } });
  };

  return (
    <div className={styles.container}>
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className={styles.title}>{t("title")}</h1>

        <p className={styles.description}>{t("description")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          <div className={styles.field}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...fieldA11y("email", errors.email)}
              {...register("email")}
            >
              {t("emailLabel")}
            </Input>
            <FormMessage id={errorId("email")} message={errors.email?.message} />
          </div>

          <FormMessage
            message={waitMinutes > 0 ? t("rateLimited", { minutes: waitMinutes }) : serverError}
            alert
          />

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? tc("loading") : t("sendCode")}
          </Button>
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

export default RvPassword;
