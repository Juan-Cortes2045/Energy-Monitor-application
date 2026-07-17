import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./RegisterForm.module.css";
import { registerSchema } from "../../validation/registerSchema.js";
import { useNavigate } from "react-router-dom";
import colors from "../../../../design/tokens/colors.js";
import { useTranslation } from "react-i18next";

import googleIcon from "../../../../assets/google_icon.png";

import Button from "../../../../design/components/Button/Button.jsx";
import Input from "../../../../design/components/Input/Input.jsx";
import Card from "../../../../design/components/Card/Card.jsx";
import LegalModal from "../LegalModal/LegalModal.jsx";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const RegisterForm = () => {
  const { t: v } = useTranslation("validations");
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [legalTab, setLegalTab] = useState(null); // null | "terms" | "privacy"

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema(v)),
    mode: "onChange",
  });

  const password = watch("password");
  const repeatPassword = watch("repeatPassword");

  const navigate = useNavigate();
  const onSubmit = async (data) => {
    console.log("register:", data);
    navigate("/VerifyAccount");
  };

  return (
    <div className={styles.wrapper}>
      <Card>
        <div className={styles.scrollContent}>
          <h2 className={styles.title}>{t("register.title")}</h2>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {/* NAME */}
            <Input id="name" type="text" placeholder="*" {...register("name")}>
              {t("register.name")}
            </Input>
            {errors.name && (
              <span className={styles.error}>
                {errors.name.message}
              </span>
            )}

            {/* EMAIL */}
            <Input
              id="email"
              type="email"
              placeholder="*"
              {...register("email")}
            >
              {t("register.email")}
            </Input>
            {errors.email && (
              <span className={styles.error}>
                {errors.email.message}
              </span>
            )}

            {/* PASSWORD */}
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="*"
              icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              onIconClick={() => setShowPassword(!showPassword)}
              {...register("password")}
            >
              {t("register.password")}
            </Input>
            {errors.password && (
              <span className={styles.error}>
                {errors.password.message}
              </span>
            )}

            {/* REPEAT PASSWORD */}
            <Input
              id="repeatPassword"
              type={showRepeatPassword ? "text" : "password"}
              placeholder="*"
              icon={
                showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />
              }
              onIconClick={() => setShowRepeatPassword(!showRepeatPassword)}
              {...register("repeatPassword")}
            >
              {t("register.repeatPassword")}
            </Input>
            {errors.repeatPassword && (
              <span className={styles.error}>
                {errors.repeatPassword.message}
              </span>
            )}

            {/* TERMS */}
            <div className={styles.options}>
              <input
                type="checkbox"
                className={styles.checkbox}
                {...register("terms")}
              />
              <label className={styles.terms}>
                <p>
                  {t("register.termsPrefix")}{" "}
                  <span
                    className={styles.registerLink}
                    style={{ color: colors.secondary }}
                    onClick={() => setLegalTab("terms")}
                  >
                    {t("register.terms")}
                  </span>{" "}
                  y la{" "}
                  <span
                    className={styles.registerLink}
                    style={{ color: colors.secondary }}
                    onClick={() => setLegalTab("privacy")}
                  >
                    {t("register.privacy")}
                  </span>
                </p>
              </label>
            </div>
            <div>
              {errors.terms && (
                <span className={styles.error}>
                  {errors.terms.message}
                </span>
              )}
            </div>

            {/* BUTTONS */}
            <div className={styles.buttonsContainer}>
              <Button type="submit" variant="primary">
                {t("register.submit")}
              </Button>

              {/* DIVIDER */}
              <div className={styles.divider}>
                <span>{t("register.divider")}</span>
              </div>

              {/* GOOGLE */}
              <p>{t("register.registerWith")}</p>
              <Button type="button" variant="secondary" icon={googleIcon}>
                {t("register.google")}
              </Button>
            </div>

            {/* LOGIN */}
            <p className={styles.register}>
              {t("register.haveAccount")}.{" "}
              <a
                href="/login"
                style={{ color: colors.secondary }}
                className={styles.registerLink}
              >
                {t("register.login")}
              </a>
            </p>
          </form>
        </div>
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