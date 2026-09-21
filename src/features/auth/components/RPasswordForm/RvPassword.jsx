import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import styles from "./RecoverPassword.module.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { recoverSchema } from "../../validation/recoverSchema.js";

const RvPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const { t: v } = useTranslation("validations");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(recoverSchema(v)) });

  const onSubmit = () => {
    console.log("Enviar código");
    navigate("/VerifyRecoverPassword");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} style={{ width: "400px" }}>
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("description")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <Input id="email" type="email" placeholder="*" {...register("email")}>
              {t("emailLabel")}
            </Input>
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <Button type="submit" variant="primary">
            {t("sendCode")}
          </Button>
        </form>
        <p className={styles.register}>
          {t("comeBack")}.{" "}
          <a
            href="/login"
            style={{ color: "var(--color-secondary)" }}
            className={styles.registerLink}
          >
            {t("login")}
          </a>
        </p>
      </Card>
    </div>
  );
};

export default RvPassword;
