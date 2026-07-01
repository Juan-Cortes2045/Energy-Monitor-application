import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation/loginSchema.js";
import styles from "../LoginForm/LoginForm.module.css";
import colors from "../../../../design/tokens/colors.js";
import { useTranslation } from "react-i18next";

import googleIcon from "../../../../assets/google_icon.png";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const LoginForm = () => {
  const { t: v } = useTranslation("validations");
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema(v)),
  });

  const onSubmit = (data) => {
    console.log("login:", data);
    navigate("/dashboard");
  };

  return (
    <Card>
      <h2 className={styles.title}>{t("login.title")}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/*EMAIL*/}
        <Input id="email" type="email" placeholder="*" {...register("email")}>
          {t("login.email")}
        </Input>
        {errors.email && (
          <span
            className={styles.error}
            style={{
              color: colors.danger,
            }}
          >
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
          <span
            className={styles.error}
            style={{
              color: colors.danger,
            }}
          >
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
              color: colors.secondary,
            }}
          >
            {t("login.forgotPassword")}
          </a>
        </div>

        <div className={styles.buttonsContainer}>
          {/*BOTON LOGIN*/}
          <Button type="submit" variant="primary">
            {t("login.submit")}
          </Button>

          {/*DIVIDER*/}
          <div
            className={styles.divider}
            style={{
              color: colors.textSecondary,
            }}
          >
            <span>{t("login.divider")}</span>
          </div>

          {/*GOOGLE LOGIN*/}
          <p className={styles.startUsing}>{t("login.loginWith")}</p>
          <Button type="button" variant="secondary" icon={googleIcon}>
            {t("login.google")}
          </Button>
        </div>

        {/*REGISTER*/}
        <p className={styles.register}>
          {t("login.noAccount")}.{" "}
          <a
            href="/register"
            className={styles.link}
            style={{
              color: colors.secondary,
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
