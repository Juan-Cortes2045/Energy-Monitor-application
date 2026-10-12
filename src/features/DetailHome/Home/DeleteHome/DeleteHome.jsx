import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import ConfirmModal from "../../../../components/shared/ConfirmModal/ConfirmModal";
import { errorMessage } from "../../../../services/http/errorMessages";
import { useHomes } from "../../../../context/useHomes";
import styles from "../Home.module.css";

/**
 * Botón "Eliminar hogar" del responsable (OWNER).
 *
 * Borrar un hogar lo quita a todos sus miembros y desvincula sus dispositivos, y no se puede
 * deshacer desde la app; por eso la confirmación pide escribir el nombre del hogar, no solo un
 * clic, para que no se borre por error.
 */
const DeleteHome = ({ home }) => {
  const { t } = useTranslation("home");
  const { deleteHome } = useHomes();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const name = home?.name ?? "";
  const matches = typedName.trim().toLowerCase() === name.trim().toLowerCase() && name.trim() !== "";

  const close = () => {
    setConfirming(false);
    setTypedName("");
  };

  const handleDelete = async () => {
    if (!matches) return;
    setDeleting(true);
    setError(null);
    const err = await deleteHome(home.idHome);
    setDeleting(false);
    if (err) {
      close();
      setError(err);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <>
      {error && (
        <p className={styles.errorText} role="alert">
          {errorMessage(t, error, "homeDelete")}
        </p>
      )}

      <Button variant="Danger" onClick={() => setConfirming(true)} disabled={deleting}>
        <Trash2 size={15} className={styles.icon} />
        {deleting ? t("buttons.deleting") : t("buttons.deleteHome")}
      </Button>

      {confirming && (
        <ConfirmModal
          title={t("confirm.deleteTitle")}
          message={t("confirm.delete")}
          confirmLabel={t("buttons.deleteHome")}
          cancelLabel={t("confirm.cancel")}
          onConfirm={handleDelete}
          onCancel={close}
          disabled={deleting}
          confirmDisabled={!matches}
        >
          <Input
            id="delete-home-name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder={name}
            autoComplete="off"
          >
            {t("confirm.deleteTypeName", { name })}
          </Input>
        </ConfirmModal>
      )}
    </>
  );
};

export default DeleteHome;
