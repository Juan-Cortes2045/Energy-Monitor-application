import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { sortHomeTypes } from "../../../shared/homeTypes";
import { errorMessage } from "../../../../services/http/errorMessages";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import AddressInput from "../AddressInput/AddressInput";
import { useDialogA11y } from "../../../../hooks/useDialogA11y";
import styles from "./CreateHomeModal.module.css";

const INITIAL_FORM = {
  name: "",
  homeTypeId: "",
  address: "",
  description: "",
};

function validate(form, t) {
  const errors = {};

  if (!form.name.trim()) errors.name = t("errors.nameRequired");
  else if (form.name.trim().length > 50) errors.name = t("errors.nameMax");

  if (!form.homeTypeId) errors.homeTypeId = t("errors.typeRequired");

  const addr = form.address.trim();
  if (!addr) {
    errors.address = t("errors.addressRequired");
  } else if (addr.length > 200) {
    errors.address = t("errors.addressMax");
  }

  if (form.description.length > 200)
    errors.description = t("errors.descriptionMax");

  return errors;
}

/**
 * Modal de crear hogar conectado al backend.
 * @param {Object} props
 * @param {Array<{idHomeType: string, name: string}>} props.types catálogo de GET /home-types
 * @param {boolean} props.typesLoading el catálogo aún se está cargando
 * @param {import("../../../services/home").ApiError | null} props.serverError
 * @param {(payload: Object) => Promise<boolean>} props.onSubmit devuelve true si se creó
 */
const CreateHomeModal = ({
  types = [],
  typesLoading = false,
  serverError = null,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation("createHomeModal");
  const { t: tc } = useTranslation("common");
  const dialogRef = useDialogA11y(onClose);
  // Sin catálogo no se puede crear; mientras carga no se muestra el error.
  const noTypes = !typesLoading && types.length === 0;

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate(form, t);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        homeTypeId: form.homeTypeId,
        address: form.address.trim(),
        description: form.description.trim() || undefined,
      };

      const ok = await onSubmit?.(payload);
      if (ok) {
        setForm(INITIAL_FORM);
        setErrors({});
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
        aria-labelledby="create-modal-title"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <h2 className={styles.title} id="create-modal-title">
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

        {noTypes && (
          <p className={styles.errorMsg} role="alert">{t("errors.noTypesAvailable")}</p>
        )}
        {serverError && (
          <p className={styles.errorMsg} role="alert">{errorMessage(t, serverError, "homeCreate")}</p>
        )}

        <form id="create-home-form" className={styles.body} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-name">
              {t("fields.name")} <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <Input
              id="create-name"
              placeholder={t("placeholders.name")}
              value={form.name}
              onChange={handleChange("name")}
              maxLength={50}
              autoFocus
              aria-required="true"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "create-name-error" : undefined}
            />
            {errors.name && (
              <span id="create-name-error" className={styles.errorMsg} role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-type">
              {t("fields.type")} <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <select
              id="create-type"
              className={`${styles.select} ${errors.homeTypeId ? styles.error : ""}`}
              value={form.homeTypeId}
              onChange={handleChange("homeTypeId")}
              disabled={typesLoading}
              aria-busy={typesLoading}
              aria-required="true"
              aria-invalid={Boolean(errors.homeTypeId)}
              aria-describedby={errors.homeTypeId ? "create-type-error" : undefined}
            >
              <option value="" disabled>
                {typesLoading ? tc("loading") : t("placeholders.type")}
              </option>
              {sortHomeTypes(types).map((type) => (
                <option key={type.idHomeType} value={type.idHomeType}>
                  {t(`homeTypes.${type.name}`, { defaultValue: type.name })}
                </option>
              ))}
            </select>
            {errors.homeTypeId && (
              <span id="create-type-error" className={styles.errorMsg} role="alert">
                {errors.homeTypeId}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-address">
              {t("fields.address")} <span className={styles.required} aria-hidden="true">*</span>
            </label>
            <AddressInput
              id="create-address"
              placeholder={t("placeholders.address")}
              value={form.address}
              onChange={handleChange("address")}
              error={errors.address}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-description">
              {t("fields.description")}
              <span> {t("fields.optional")}</span>
            </label>
            <textarea
              id="create-description"
              className={styles.textarea}
              placeholder={t("placeholders.description")}
              value={form.description}
              onChange={handleChange("description")}
              maxLength={200}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description
                  ? "create-description-count create-description-error"
                  : "create-description-count"
              }
            />
            <span id="create-description-count" className={styles.charCount}>
              {form.description.length} / 200
            </span>
            {errors.description && (
              <span id="create-description-error" className={styles.errorMsg} role="alert">
                {errors.description}
              </span>
            )}
          </div>
        </form>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
          <Button
            type="submit"
            form="create-home-form"
            variant="primary"
            disabled={loading || typesLoading || noTypes}
            aria-busy={loading}
          >
            {loading ? t("buttons.creating") : t("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateHomeModal;
