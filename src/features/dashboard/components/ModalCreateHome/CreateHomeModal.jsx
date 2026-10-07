import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sortHomeTypes } from "../../../shared/homeTypes";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import AddressInput from "../AddressInput/AddressInput";
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
 * @param {import("../../../services/home").ApiError | null} props.serverError
 * @param {(payload: Object) => Promise<boolean>} props.onSubmit devuelve true si se creó
 */
const CreateHomeModal = ({ types = [], serverError = null, onClose, onSubmit }) => {
  const { t } = useTranslation("createHomeModal");

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
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("title")}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("close")}
          >
            x
          </button>
        </div>

        {types.length === 0 && (
          <p className={styles.errorMsg} role="alert">{t("errors.noTypesAvailable")}</p>
        )}
        {serverError && (
          <p className={styles.errorMsg} role="alert">{serverError.message}</p>
        )}

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-name">
              {t("fields.name")} <span>*</span>
            </label>
            <Input
              id="create-name"
              placeholder={t("placeholders.name")}
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
              maxLength={50}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-type">
              {t("fields.type")} <span>*</span>
            </label>
            <select
              id="create-type"
              className={styles.select}
              value={form.homeTypeId}
              onChange={handleChange("homeTypeId")}
            >
              <option value="" disabled>
                {t("placeholders.type")}
              </option>
              {sortHomeTypes(types).map((type) => (
                <option key={type.idHomeType} value={type.idHomeType}>
                  {t(`homeTypes.${type.name}`, { defaultValue: type.name })}
                </option>
              ))}
            </select>
            {errors.homeTypeId && <span className={styles.errorMsg}>{errors.homeTypeId}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="create-address">
              {t("fields.address")} <span>*</span>
            </label>
            <AddressInput
              id="create-address"
              placeholder={t("placeholders.address")}
              value={form.address}
              onChange={handleChange("address")}
              error={errors.address}
            />
            {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
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
            />
            <span className={styles.charCount}>{form.description.length} / 200</span>
            {errors.description && <span className={styles.errorMsg}>{errors.description}</span>}
          </div>
        </form>

        <div className={styles.footer}>
          <Button onClick={onClose} disabled={loading}>
            {t("buttons.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || types.length === 0}>
            {loading ? t("buttons.creating") : t("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateHomeModal;
