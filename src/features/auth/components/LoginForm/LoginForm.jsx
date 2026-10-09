import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation/loginSchema.js";
import styles from "../LoginForm/LoginForm.module.css";
import { useTranslation } from "react-i18next";

import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton.jsx";
import { isGoogleEnabled } from "../../../../services/auth/googleSignIn";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { login } from "../../../../services/auth/authApi";
import { errorMessage } from "../../../../services/http/errorMessages";

const LoginForm = () => {
  const { t: v } = useTranslation("validations");
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const notice = useLocation().state?.notice;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema(v)),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
      navigate("/dashboard");
    } catch (e) {
      setServerError(errorMessage(t, e, "login"));
    }
  };

  return (
    <Card
      style={{
        width: "400px",
      }}
    >
      <h2 className={styles.title}>{t("login.title")}</h2>

      {notice && <p role="status">{t(`login.notice.${notice}`)}</p>}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/*EMAIL*/}
        <Input id="email" type="email" placeholder="*" {...register("email")}>
          {t("login.email")}
        </Input>
        {errors.email && (
          <span className={styles.error}>
            {errors.email.message}
          </span>
        )}

        {/*PASSWORD*/}
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="*"
          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onIconClick={() => setShowPassword(!showPassword)}
          {...register("password")}
        >
          {t("login.password")}
        </Input>
        {errors.password && (
          <span className={styles.error}>
            {errors.password.message}
          </span>
        )}

        {/*OPCIONES*/}
        <div className={styles.options}>
          <label className={styles.renember}>
            <input type="checkbox" />
            {t("login.remember")}
          </label>

          <a
            href="/recover-password"
            className={styles.link}
            style={{
              color: "var(--color-secondary)",
            }}
          >
            {t("login.forgotPassword")}
          </a>
        </div>

        {serverError && <span className={styles.error}>{serverError}</span>}

        <div className={styles.buttonsContainer}>
          {/*BOTON LOGIN*/}
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {t("login.submit")}
          </Button>

          {isGoogleEnabled() && (
            <>
              {/*DIVIDER*/}
              <div
                className={styles.divider}
                style={{
                  color: "var(--color-text-secondary)",
                }}
              >
                <span>{t("login.divider")}</span>
              </div>

              {/*GOOGLE LOGIN*/}
              <p className={styles.startUsing}>{t("login.loginWith")}</p>
              <GoogleSignInButton
                label={t("login.google")}
                onError={setServerError}
              />
            </>
          )}
        </div>

        {/*REGISTER*/}
        <p className={styles.register}>
          {t("login.noAccount")}.{" "}
          <a
            href="/register"
            className={styles.link}
            style={{
              color: "var(--color-secondary)",
            }}
          >
            {t("login.register")}
          </a>
        </p>
      </form>
    </Card>
  );
};

export default LoginForm;
