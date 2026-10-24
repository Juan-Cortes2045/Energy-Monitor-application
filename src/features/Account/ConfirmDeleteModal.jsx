import { useState } from "react";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Input from "../../design/components/Input/Input";
import Button from "../../design/components/Button/Button";
import { useDialogA11y } from "../../hooks/useDialogA11y";
import styles from "./Modal.module.css";

// Confirmación previa a eliminar la cuenta: pide la contraseña y llama onConfirm(password).
const ConfirmDeleteModal = ({ onClose, onConfirm, error = "" }) => {
  const { t } = useTranslation("account");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  // Mientras se elimina no se puede cerrar: la petición ya está en curso.
  const dialogRef = useDialogA11y(() => !busy && onClose());

  const submit = async (e) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    try {
      await onConfirm(password);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div
        ref={dialogRef}
        className={styles.box}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-message"
        tabIndex={-1}
      >
        <Card>
          <form className={styles.content} onSubmit={submit}>
            <h2 id="delete-title" className={styles.title}>
              {t("deleteModal.title")}
            </h2>
            <p id="delete-message" className={styles.message}>
              {t("deleteModal.message")}
            </p>
            <Input
              id="deletePassword"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "deletePassword-error" : undefined}
            >
              {t("deleteModal.password")}
            </Input>
            {error && (
              <p id="deletePassword-error" className={styles.error} role="alert">
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose} disabled={busy}>
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant="Danger"
                disabled={!password || busy}
                aria-busy={busy}
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
