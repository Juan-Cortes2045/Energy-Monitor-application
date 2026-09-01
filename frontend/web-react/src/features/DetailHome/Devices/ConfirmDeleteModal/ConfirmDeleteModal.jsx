import { useTranslation } from "react-i18next";
import { AlertTriangle, X } from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import styles from "./ConfirmDeleteModal.module.css";

const ConfirmDeleteModal = ({ device, onCancel, onConfirm }) => {
  const { t } = useTranslation("devices");

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel?.();
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          aria-label={t("confirmDelete.cancel")}
        >
          <X size={16} />
        </button>

        <div className={styles.iconWrap}>
          <AlertTriangle size={22} />
        </div>

        <p id="confirm-delete-title" className={styles.title}>
          {t("confirmDelete.title")}
        </p>
        <p className={styles.message}>
          {t("confirmDelete.message", {
            name: device?.name || t(`applianceTypes.${device?.applianceType}`),
          })}
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel}>
            {t("confirmDelete.cancel")}
          </Button>
          <Button variant="Danger" onClick={() => onConfirm?.(device)}>
            {t("confirmDelete.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
