import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, X } from "lucide-react";
import { errorMessage } from "../../../../services/http/errorMessages";
import Button from "../../../../design/components/Button/Button";
import { useDialogA11y } from "../../../../hooks/useDialogA11y";
import styles from "./JoinHomeModal.module.css";

const CODE_LENGTH = 8;
const CODE_REGEX = /^[A-Z0-9]{8}$/;

function validate(code, t) {
  if (!code.trim()) return t("errors.required");
  if (!CODE_REGEX.test(code.toUpperCase())) return t("errors.invalid");
  return null;
}

/**
 * Modal de unirse a un hogar conectado al backend.
 * @param {import("../../../services/home").ApiError | null} props.serverError
 * @param {(code: string) => Promise<boolean>} props.onSubmit devuelve true si se unió
 */
const JoinHomeModal = ({ serverError = null, onClose, onSubmit }) => {
  const { t } = useTranslation("joinHomeModal");
  const { t: tc } = useTranslation("common");
  const dialogRef = useDialogA11y(onClose);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
    setCode(val);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const err = validate(code, t);
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const ok = await onSubmit?.(code);
      if (ok) {
        setCode("");
        onClose?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 className={styles.title} id="join-modal-title">
            {t("title")}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={tc("close")}
          >
            <X size={18} />
          </button>
        </div>

        <form id="join-home-form" className={styles.body} onSubmit={handleSubmit} noValidate>
          <div className={styles.iconWrapper}>
            <KeyRound size={32} />
          </div>

          <p className={styles.description}>{t("description")}</p>

          {serverError && (
            <p className={styles.errorMsg} role="alert">{errorMessage(t, serverError, "homeJoin")}</p>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="join-code">
              {t("label")} <span className={styles.required} aria-hidden="true">*</span>
            </label>

            <div className={`${styles.inputWrapper} ${error ? styles.inputError : ""}`}>
              <input
                id="join-code"
                className={styles.input}
                type="text"
                value={code}
                onChange={handleChange}
                placeholder={t("placeholder")}
                maxLength={CODE_LENGTH}
                autoComplete="off"
                autoFocus
                spellCheck={false}
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "join-code-error join-code-hint" : "join-code-hint"}
              />
              <span className={styles.counter} aria-hidden="true">
                {code.length}/{CODE_LENGTH}
              </span>
            </div>

            {error && (
              <span id="join-code-error" className={styles.errorMsg} role="alert">
                {error}
              </span>
            )}

            <p id="join-code-hint" className={styles.hint}>{t("hint")}</p>
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="secondary" size="medium" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="join-home-form"
            variant="primary"
            size="medium"
            disabled={loading || code.length < CODE_LENGTH}
            aria-busy={loading}
          >
            {loading ? t("joining") : t("join")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinHomeModal;
