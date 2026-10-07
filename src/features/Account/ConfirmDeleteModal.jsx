import { useTranslation } from "react-i18next";

import Card from "../../design/components/Card/Card";
import Button from "../../design/components/Button/Button";
import styles from "./Modal.module.css";

// Confirmación previa a eliminar la cuenta. No hace la eliminación: avisa con onConfirm.
const ConfirmDeleteModal = ({ onClose, onConfirm, error = "" }) => {
  const { t } = useTranslation("account");

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.box}>
        <Card>
          <div className={styles.content} role="alertdialog" aria-labelledby="delete-title">
            <h2 id="delete-title" className={styles.title}>
              {t("deleteModal.title")}
            </h2>
            <p className={styles.message}>{t("deleteModal.message")}</p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={onConfirm}
                style={{ backgroundColor: "var(--color-danger)" }}
              >
                {t("deleteModal.confirm")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
