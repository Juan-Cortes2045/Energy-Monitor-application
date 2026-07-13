import { useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import AddressInput from "../AddressInput/AddressInput"; // ✅ nuevo componente
import styles from "./CreateProjectModal.module.css";

const PROJECT_TYPES = [
  { id: "PT001", key: "house" },
  { id: "PT002", key: "apartment" },
  { id: "PT003", key: "studio" },
  { id: "PT004", key: "other" },
];

const INITIAL_FORM = {
  name: "",
  projectTypeId: "",
  otherProjectType: "",
  address: "",
  description: "",
};

// ─── Validaciones ─────────────────────────────────────────────────────────────
function validate(form, t, isOther) {
  const errors = {};

  if (!form.name.trim()) errors.name = t("errors.nameRequired");
  else if (form.name.trim().length > 50) errors.name = t("errors.nameMax");

  if (!form.projectTypeId) errors.projectTypeId = t("errors.typeRequired");

  if (isOther && !form.otherProjectType.trim())
    errors.otherProjectType = t("errors.otherRequired");
  else if (isOther && form.otherProjectType.trim().length > 50)
    errors.otherProjectType = t("errors.otherMax");

  const addr = form.address.trim();
  if (!addr) {
    errors.address = t("errors.addressRequired");
  } else if (addr.length > 200) {
    errors.address = t("errors.addressMax");
  } else if (/[<>{}[\]|"`']/.test(form.address)) {
    errors.address = t("errors.addressInvalidChars");
  } else if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9\s#\-.,()/]+$/.test(addr)) {
    errors.address = t("errors.addressInvalidChars");
  } else {
    const hasHash = /#/.test(addr);
    const hasNo = /No\.?\s+\d/i.test(addr);
    const hasKeyword = /\b(Calle|Cra\.?|Carrera|Av\.?|Avenida|Transversal|Diagonal|Vereda|Finca|Apartamento|Apto|Oficina|Local)\b/i.test(addr);
    if (!hasHash && !hasNo && !hasKeyword) {
      errors.address = t("errors.addressInvalidFormat");
    }
  }

  if (form.description.length > 200)
    errors.description = t("errors.descriptionMax");

  return errors;
}

const CreateProjectModal = ({ onClose, onSubmit }) => {
  const { t } = useTranslation("createProjectModal");

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const selectedType = PROJECT_TYPES.find((t) => t.id === form.projectTypeId);
  const isOther = selectedType?.key === "other";

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "projectTypeId") {
        const type = PROJECT_TYPES.find((t) => t.id === value);
        if (type?.key !== "other") next.otherProjectType = "";
      }
      return next;
    });

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate(form, t, isOther);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        projectTypeId: form.projectTypeId,
        otherProjectType: isOther ? form.otherProjectType.trim() : "",
        address: form.address.trim(),
        description: form.description.trim(),
      };

      onSubmit?.(payload);
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

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className={styles.field}>
            <label className={styles.label}>
              {t("fields.name")} <span>*</span>
            </label>
            <Input
              placeholder={t("placeholders.name")}
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
              maxLength={50}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          {/* Tipo */}
          <div className={styles.field}>
            <label className={styles.label}>
              {t("fields.type")} <span>*</span>
            </label>
            <select
              className={styles.select}
              value={form.projectTypeId}
              onChange={handleChange("projectTypeId")}
            >
              <option value="" disabled>
                {t("placeholders.type")}
              </option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {t(`projectTypes.${type.key}`)}
                </option>
              ))}
            </select>
            {errors.projectTypeId && <span className={styles.errorMsg}>{errors.projectTypeId}</span>}
          </div>

          {/* Otro */}
          {isOther && (
            <div className={styles.field}>
              <label className={styles.label}>
                {t("fields.other")} <span>*</span>
              </label>
              <Input
                placeholder={t("placeholders.other")}
                value={form.otherProjectType}
                onChange={handleChange("otherProjectType")}
                error={errors.otherProjectType}
                maxLength={50}
              />
              {errors.otherProjectType && (
                <span className={styles.errorMsg}>{errors.otherProjectType}</span>
              )}
            </div>
          )}

          {/* Dirección – ahora usando AddressInput */}
          <div className={styles.field}>
            <label className={styles.label}>
              {t("fields.address")} <span>*</span>
            </label>
            <AddressInput
              placeholder={t("placeholders.address")}
              value={form.address}
              onChange={handleChange("address")}
              error={errors.address}
            />
            {errors.address && <span className={styles.errorMsg}>{errors.address}</span>}
          </div>

          {/* Descripción */}
          <div className={styles.field}>
            <label className={styles.label}>
              {t("fields.description")}
              <span> {t("fields.optional")}</span>
            </label>
            <textarea
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
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t("buttons.creating") : t("buttons.create")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;