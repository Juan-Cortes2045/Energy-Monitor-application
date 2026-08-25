import Card from "../../../../design/components/Card/Card";
import Input from "../../../../design/components/Input/Input";
import Button from "../../../../design/components/Button/Button";
import styles from "./RecoverPassword.module.css";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const RvPassword = () => {
  const { t } = useTranslation("recoverPassword");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviar código");
    navigate("/VerifyRecoverPassword");
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} style={{ width: "400px" }}>
        <h2 className={styles.title}>{t("title")}</h2>

        <p className={styles.description}>{t("description")}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <Input id="email" type="email" placeholder="*">
              {t("emailLabel")}
            </Input>
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
