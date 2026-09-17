import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import AddressInput from "../AddressInput/AddressInput";
import styles from "./CreateHomeModal.module.css";
import { listHomeTypes } from "../../../../services/catalog.service";

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

const CreateHomeModal = ({ onClose, onSubmit }) => {
  const { t } = useTranslation("createHomeModal");

  const [homeTypes, setHomeTypes] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    listHomeTypes({ signal: controller.signal })
      .then(setHomeTypes)
      .catch(() => setHomeTypes([]));
    return () => controller.abort();
  }, []);

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
    setSubmitError(null);
    try {
      await onSubmit?.({
        name: form.name.trim(),
        home_type_id: form.homeTypeId,
        address: form.address.trim(),
        description: form.description.trim() || null,
      });
      onClose?.();
    } catch (err) {
      setSubmitError(err.message);
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

          <div className={styles.field}>
            <label className={styles.label}>
              {t("fields.type")} <span>*</span>
            </label>
            <select
              className={styles.select}
              value={form.homeTypeId}
              onChange={handleChange("homeTypeId")}
            >
              <option value="" disabled>
                {t("placeholders.type")}
              </option>
              {homeTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {t(`homeTypes.${type.name}`)}
                </option>
              ))}
            </select>
            {errors.homeTypeId && <span className={styles.errorMsg}>{errors.homeTypeId}</span>}
          </div>

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

          {submitError && <span className={styles.errorMsg}>{submitError}</span>}
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

export default CreateHomeModal;
