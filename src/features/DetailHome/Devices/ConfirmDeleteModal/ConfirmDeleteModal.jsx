import { useTranslation } from "react-i18next";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";

const ConfirmDeleteModal = ({ device, onCancel, onConfirm, disabled = false }) => {
  const { t } = useTranslation("devices");

  return (
    <ConfirmModal
      title={t("confirmDelete.title")}
      message={t("confirmDelete.message", {
        name: device?.name || t(`applianceTypes.${device?.applianceType}`),
      })}
      confirmLabel={t("confirmDelete.confirm")}
      cancelLabel={t("confirmDelete.cancel")}
      onCancel={onCancel}
      onConfirm={() => onConfirm?.(device)}
      disabled={disabled}
    />
  );
};

export default ConfirmDeleteModal;
