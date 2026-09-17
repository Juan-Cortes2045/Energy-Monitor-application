import { useState } from "react";
import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import styles from "./RecoverPassword.module.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recoverPassword } from "../../../../services/auth.service";

const RvPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const { t: tAuth } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSubmitting(true);
    try {
      const { resetToken } = await recoverPassword({ email });
      navigate("/verify-recover-password", { state: { email, mockCode: resetToken } });
    } catch (err) {
      setServerError(err.code === "USER_NOT_FOUND" ? t("userNotFound") : tAuth(`errors.${err.code}`, tAuth("errors.generic")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} style={{ width: "400px" }}>
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("description")}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input
              id="email"
              type="email"
              placeholder="*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            >
              {t("emailLabel")}
            </Input>
          </div>

          {serverError && <span className={styles.error}>{serverError}</span>}

          <Button type="submit" variant="primary" disabled={submitting}>
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
