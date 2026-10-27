import { useState } from "react";
import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Input from "../../design/components/Input/Input";
import Button from "../../design/components/Button/Button";
import { useDialogA11y } from "../../hooks/useDialogA11y";
import styles from "./Modal.module.css";

/**
 * Confirmación previa a eliminar la cuenta. Con contraseña llama onConfirm({ password }).
 * Una cuenta creada con Google no tiene contraseña: primero pide el código que llega al correo
 * (onRequestCode, que devuelve si se envió) y luego llama onConfirm({ code }).
 */
const ConfirmDeleteModal = ({
  onClose,
  onConfirm,
  onRequestCode,
  googleAccount = false,
  email = "",
  error = "",
}) => {
  const { t } = useTranslation("account");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  // Mientras se elimina o se envía el código no se puede cerrar: la petición ya está en curso.
  const dialogRef = useDialogA11y(() => !busy && onClose());

  const confirmation = googleAccount ? { code } : { password };
  const ready = googleAccount ? /^\d{6}$/.test(code) : Boolean(password);

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true);
    try {
      await onConfirm(confirmation);
    } finally {
      setBusy(false);
    }
  };

  const requestCode = async () => {
    setBusy(true);
    try {
      if (await onRequestCode()) setCodeSent(true);
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

            {googleAccount ? (
              <>
                <p className={styles.message} role="status">
                  {codeSent
                    ? t("deleteModal.codeSent", { email })
                    : t("deleteModal.googleMessage", { email })}
                </p>
                {codeSent && (
                  <Input
                    id="deleteCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "deleteConfirm-error" : undefined}
                  >
                    {t("deleteModal.code")}
                  </Input>
                )}
                <Button variant="secondary" onClick={requestCode} disabled={busy} aria-busy={busy}>
                  {codeSent ? t("deleteModal.resendCode") : t("deleteModal.sendCode")}
                </Button>
              </>
            ) : (
              <Input
                id="deletePassword"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "deleteConfirm-error" : undefined}
              >
                {t("deleteModal.password")}
              </Input>
            )}

            {error && (
              <p id="deleteConfirm-error" className={styles.error} role="alert">
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
                disabled={!ready || busy}
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
