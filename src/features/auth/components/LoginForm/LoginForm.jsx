import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../validation/loginSchema.js";
import styles from "../LoginForm/LoginForm.module.css";
import { useTranslation } from "react-i18next";

import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton.jsx";
import FormMessage from "../FormMessage/FormMessage.jsx";
import { errorId, fieldA11y } from "../FormMessage/fieldA11y.js";
import { isGoogleEnabled } from "../../../../services/auth/googleSignIn";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { login, resendVerification } from "../../../../services/auth/authApi";
import { errorMessage } from "../../../../services/http/errorMessages";
import { landingPath } from "../../../../services/auth/session";
import { useTermsConsent } from "../../hooks/useTermsConsent.jsx";

const LoginForm = () => {
  const { t: v } = useTranslation("validations");
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const terms = useTermsConsent();
  const notice = location.state?.notice;
  // Solo avisos conocidos: un valor inesperado no debe mostrar la clave cruda.
  const noticeText = notice ? t(`login.notice.${notice}`, { defaultValue: "" }) : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema(v)),
    // Al volver de verificar el correo, la dirección ya viene escrita.
    defaultValues: { email: location.state?.email ?? "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      try {
        await login(data);
      } catch (e) {
        // La cuenta nunca aceptó los términos (creada con Google antes de que se pidieran):
        // se muestran y, si los acepta, se repite el login aceptándolos.
        if (e?.status !== 428) throw e;
        if (!(await terms.ask())) {
          setServerError(t("errors:terms.required"));
          return;
        }
        await login({ ...data, acceptTerms: true });
      }
      navigate(landingPath());
    } catch (e) {
      if (e.status === 403) {
        // Contraseña correcta pero correo sin verificar: se pide un código nuevo y se lleva a la
        // persona a escribirlo. Si el envío falla (p. ej. límite de intentos), la pantalla de
        // verificación le deja pedirlo otra vez.
        let codeSent = true;
        try {
          await resendVerification(data.email);
        } catch {
          codeSent = false;
        }
        navigate("/VerifyAccount", {
          state: { email: data.email, reason: "unverified", codeSent },
        });
        return;
      }
      setServerError(errorMessage(t, e, "login"));
    }
  };

  return (
    <Card style={{ width: "100%", maxWidth: "400px" }}>
      <h1 className={styles.title}>{t("login.title")}</h1>

      <FormMessage message={noticeText} tone="success" />

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {/*EMAIL*/}
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...fieldA11y("email", errors.email)}
          {...register("email")}
        >
          {t("login.email")}
        </Input>
        <FormMessage id={errorId("email")} message={errors.email?.message} />

        {/*PASSWORD*/}
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onIconClick={() => setShowPassword(!showPassword)}
          iconLabel={tc(showPassword ? "hidePassword" : "showPassword")}
          {...fieldA11y("password", errors.password)}
          {...register("password")}
        >
          {t("login.password")}
        </Input>
        <FormMessage id={errorId("password")} message={errors.password?.message} />

        {/*OPCIONES*/}
        <div className={styles.options}>
          <Link to="/recover-password" className={styles.link}>
            {t("login.forgotPassword")}
          </Link>
        </div>

        <FormMessage message={serverError} alert />

        <div className={styles.buttonsContainer}>
          {/*BOTON LOGIN*/}
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? tc("loading") : t("login.submit")}
          </Button>

          {isGoogleEnabled() && (
            <>
              {/*DIVIDER*/}
              <div className={styles.divider} aria-hidden="true">
                <span>{t("login.divider")}</span>
              </div>

              {/*GOOGLE LOGIN*/}
              <GoogleSignInButton
                label={t("login.google")}
                onError={setServerError}
              />
            </>
          )}
        </div>

        {/*REGISTER*/}
        <p className={styles.register}>
          {t("login.noAccount")}{" "}
          <Link to="/register" className={styles.link}>
            {t("login.register")}
          </Link>
        </p>
      </form>
      {terms.modal}
    </Card>
  );
};

export default LoginForm;
