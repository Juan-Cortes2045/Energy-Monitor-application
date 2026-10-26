import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./RegisterForm.module.css";
import { registerSchema } from "../../validation/registerSchema.js";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton.jsx";
import FormMessage from "../FormMessage/FormMessage.jsx";
import { errorId, fieldA11y } from "../FormMessage/fieldA11y.js";
import { isGoogleEnabled } from "../../../../services/auth/googleSignIn";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";
import LegalModal from "../LegalModal/LegalModal.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { register as registerUser } from "../../../../services/auth/authApi";
import { errorMessage } from "../../../../services/http/errorMessages";

const PASSWORD_HINT_ID = "password-hint";

const RegisterForm = () => {
  const { t: v } = useTranslation("validations");
  const { t } = useTranslation("auth");
  const { t: tc } = useTranslation("common");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [legalTab, setLegalTab] = useState(null); // null | "terms" | "privacy"

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema(v)),
    mode: "onChange",
  });

  // El checkbox ya marcado se envía con Google, que así no vuelve a preguntar los términos.
  const termsAccepted = useWatch({ control, name: "terms" }) === true;

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    // Cuerpo de `POST /api/v1/auth/register` (`RegisterRequest`): se listan los
    // campos a propósito para no filtrar `repeatPassword` ni `terms`, que son
    // controles del formulario.
    const { name, lastName, email, password } = data;
    const payload = {
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      // El formulario no se envía sin el checkbox; el backend lo exige (428 sin él).
      acceptTerms: true,
    };

    setServerError("");
    try {
      await registerUser(payload);
      // El backend envía el código de verificación al crear la cuenta.
      navigate("/VerifyAccount", { state: { email: payload.email } });
    } catch (e) {
      setServerError(errorMessage(t, e, "register"));
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* El panel derecho de AuthLayout es el que hace scroll si el formulario no cabe */}
      <Card>
        <h1 className={styles.title}>{t("register.title")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* NOMBRE + APELLIDO */}
          <div className={styles.nameRow}>
            <div className={styles.nameCell}>
              <Input
                id="name"
                type="text"
                autoComplete="given-name"
                {...fieldA11y("name", errors.name)}
                {...register("name")}
              >
                {t("register.name")}
              </Input>
              <FormMessage id={errorId("name")} message={errors.name?.message} />
            </div>

            <div className={styles.nameCell}>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                {...fieldA11y("lastName", errors.lastName)}
                {...register("lastName")}
              >
                {t("register.lastName")}
              </Input>
              <FormMessage id={errorId("lastName")} message={errors.lastName?.message} />
            </div>
          </div>

          {/* EMAIL */}
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...fieldA11y("email", errors.email)}
            {...register("email")}
          >
            {t("register.email")}
          </Input>
          <FormMessage id={errorId("email")} message={errors.email?.message} />

          {/* PASSWORD: las reglas se muestran antes de escribir, no solo al fallar */}
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onIconClick={() => setShowPassword(!showPassword)}
            iconLabel={tc(showPassword ? "hidePassword" : "showPassword")}
            {...fieldA11y("password", errors.password, PASSWORD_HINT_ID)}
            {...register("password")}
          >
            {t("register.password")}
          </Input>
          <p id={PASSWORD_HINT_ID} className={styles.hint}>
            {t("register.passwordHint")}
          </p>
          <FormMessage id={errorId("password")} message={errors.password?.message} />

          {/* REPEAT PASSWORD */}
          <Input
            id="repeatPassword"
            type={showRepeatPassword ? "text" : "password"}
            autoComplete="new-password"
            icon={
              showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />
            }
            onIconClick={() => setShowRepeatPassword(!showRepeatPassword)}
            iconLabel={tc(showRepeatPassword ? "hidePassword" : "showPassword")}
            {...fieldA11y("repeatPassword", errors.repeatPassword)}
            {...register("repeatPassword")}
          >
            {t("register.repeatPassword")}
          </Input>
          <FormMessage
            id={errorId("repeatPassword")}
            message={errors.repeatPassword?.message}
          />

          {/* TERMS: los enlaces abren el modal; son botones para poder usarlos con teclado */}
          <div className={styles.options}>
            <input
              id="terms"
              type="checkbox"
              className={styles.checkbox}
              {...fieldA11y("terms", errors.terms)}
              {...register("terms")}
            />
            <label htmlFor="terms" className={styles.terms}>
              <Trans
                t={t}
                i18nKey="register.termsText"
                components={{
                  terms: (
                    <button
                      type="button"
                      className={styles.legalLink}
                      onClick={() => setLegalTab("terms")}
                    />
                  ),
                  privacy: (
                    <button
                      type="button"
                      className={styles.legalLink}
                      onClick={() => setLegalTab("privacy")}
                    />
                  ),
                }}
              />
            </label>
          </div>
          <FormMessage id={errorId("terms")} message={errors.terms?.message} />

          <FormMessage message={serverError} alert />

          {/* BUTTONS */}
          <div className={styles.buttonsContainer}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? tc("loading") : t("register.submit")}
            </Button>

            {isGoogleEnabled() && (
              <>
                {/* DIVIDER */}
                <div className={styles.divider} aria-hidden="true">
                  <span>{t("register.divider")}</span>
                </div>

                {/* GOOGLE: crea la cuenta con el nombre, apellido, foto y correo de Google */}
                <GoogleSignInButton
                  label={t("register.google")}
                  onError={setServerError}
                  termsAccepted={termsAccepted}
                />
              </>
            )}
          </div>

          {/* LOGIN */}
          <p className={styles.register}>
            {t("register.haveAccount")}{" "}
            <Link to="/login" className={styles.registerLink}>
              {t("register.login")}
            </Link>
          </p>
        </form>
      </Card>

      {/* MODAL DE TÉRMINOS Y CONDICIONES / POLÍTICA DE PRIVACIDAD */}
      <LegalModal
        isOpen={legalTab !== null}
        activeTab={legalTab}
        onTabChange={setLegalTab}
        onClose={() => setLegalTab(null)}
      />
    </div>
  );
};

export default RegisterForm;
