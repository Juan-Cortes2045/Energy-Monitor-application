import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound } from "lucide-react";
import Button from "../../../../design/components/Button/Button";
import styles from "./JoinHomeModal.module.css";

const CODE_LENGTH = 8;
const CODE_REGEX = /^[A-Z0-9]{8}$/;

function validate(code, t) {
  if (!code.trim()) return t("errors.required");
  if (!CODE_REGEX.test(code.toUpperCase())) return t("errors.invalid");
  return null;
}

const JoinHomeModal = ({ onClose, onSubmit }) => {
  const { t } = useTranslation("joinHomeModal");
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
      onSubmit?.(code);
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="join-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title} id="join-modal-title">
            {t("title")}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          <div className={styles.iconWrapper}>
            <KeyRound size={32} />
          </div>

          <p className={styles.description}>{t("description")}</p>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="join-code">
              {t("label")} <span className={styles.required}>*</span>
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
              />
              <span className={styles.counter}>
                {code.length}/{CODE_LENGTH}
              </span>
            </div>

            {error && <span className={styles.errorMsg}>{error}</span>}

            <p className={styles.hint}>{t("hint")}</p>
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="secondary" size="medium" onClick={onClose} disabled={loading}>
            {t("cancel")}
          </Button>
          <Button variant="primary" size="medium" onClick={handleSubmit} disabled={loading || code.length < CODE_LENGTH}>
            {loading ? t("joining") : t("join")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JoinHomeModal;
