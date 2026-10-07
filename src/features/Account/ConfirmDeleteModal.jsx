import { useState } from "react";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Input from "../../design/components/Input/Input";
import Button from "../../design/components/Button/Button";
import styles from "./Modal.module.css";

// Confirmación previa a eliminar la cuenta: pide la contraseña y llama onConfirm(password).
const ConfirmDeleteModal = ({ onClose, onConfirm, error = "" }) => {
  const { t } = useTranslation("account");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await onConfirm(password);
    setBusy(false);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.box}>
        <Card>
          <form
            className={styles.content}
            role="alertdialog"
            aria-labelledby="delete-title"
            onSubmit={submit}
          >
            <h2 id="delete-title" className={styles.title}>
              {t("deleteModal.title")}
            </h2>
            <p className={styles.message}>{t("deleteModal.message")}</p>
            <Input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              placeholder="*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            >
              {t("deleteModal.password")}
            </Input>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!password || busy}
                style={{ backgroundColor: "var(--color-danger)" }}
              >
                {t("deleteModal.confirm")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
