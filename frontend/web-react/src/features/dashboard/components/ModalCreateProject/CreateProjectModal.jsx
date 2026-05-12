import { useState } from "react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import styles from "./CreateProjectModal.module.css";

const PROJECT_TYPES = [
  { id: "PT001", name: "Casa" },
  { id: "PT002", name: "Apartamento" },
  { id: "PT003", name: "Aparta estudio" },
  { id: "PT004", name: "Otro" },
];

const INITIAL_FORM = {
  name: "",
  projectTypeId: "",
  otherProjectType: "",
  address: "",
  description: "",
};

// ─── Validaciones ─────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "El nombre del proyecto es requerido.";
  else if (form.name.trim().length > 50) errors.name = "Máximo 50 caracteres.";

  if (!form.projectTypeId)
    errors.projectTypeId = "Selecciona un tipo de proyecto.";

  const isOther =
    PROJECT_TYPES.find((t) => t.id === form.projectTypeId)?.name === "Otro";
  if (isOther && !form.otherProjectType.trim())
    errors.otherProjectType = "Especifica el tipo de proyecto.";
  else if (isOther && form.otherProjectType.trim().length > 50)
    errors.otherProjectType = "Máximo 50 caracteres.";

  if (!form.address.trim()) errors.address = "La dirección es requerida.";
  else if (form.address.trim().length > 50)
    errors.address = "Máximo 50 caracteres.";

  if (form.description.length > 200)
    errors.description = "Máximo 200 caracteres.";

  return errors;
}

const CreateProjectModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const selectedTypeName =
    PROJECT_TYPES.find((t) => t.id === form.projectTypeId)?.name ?? "";
  const isOther = selectedTypeName === "Otro";

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "projectTypeId") {
        const name = PROJECT_TYPES.find((t) => t.id === value)?.name ?? "";
        if (name !== "Otro") next.otherProjectType = "";
      }
      return next;
    });

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const newErrors = validate(form);
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
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title} id="modal-title">
            Crear proyecto
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <form className={styles.body} onSubmit={handleSubmit} noValidate>
          {/* Nombre del proyecto */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-name">
              Nombre del proyecto <span className={styles.required}>*</span>
            </label>
            <Input
              id="proj-name"
              type="text"
              placeholder="Ej: Mi hogar, Oficina central..."
              value={form.name}
              onChange={handleChange("name")}
              error={errors.name}
              maxLength={50}
            />
            {errors.name && (
              <span className={styles.errorMsg}>{errors.name}</span>
            )}
          </div>

          {/* Tipo de proyecto */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-type">
              Tipo de proyecto <span className={styles.required}>*</span>
            </label>
            <select
              id="proj-type"
              className={`${styles.select} ${errors.projectTypeId ? styles.error : ""}`}
              value={form.projectTypeId}
              onChange={handleChange("projectTypeId")}
            >
              <option value="" disabled>
                Selecciona un tipo...
              </option>
              {PROJECT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.projectTypeId && (
              <span className={styles.errorMsg}>{errors.projectTypeId}</span>
            )}
          </div>

          {/* Campo "Otro" — aparece solo si el tipo seleccionado es "Otro" */}
          {isOther && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="proj-other">
                ¿Cuál? <span className={styles.required}>*</span>
              </label>
              <Input
                id="proj-other"
                type="text"
                placeholder="Describe el tipo de proyecto..."
                value={form.otherProjectType}
                onChange={handleChange("otherProjectType")}
                error={errors.otherProjectType}
                maxLength={50}
              />
              {errors.otherProjectType && (
                <span className={styles.errorMsg}>
                  {errors.otherProjectType}
                </span>
              )}
            </div>
          )}

          {/* Dirección */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-address">
              Dirección <span className={styles.required}>*</span>
            </label>
            <Input
              id="proj-address"
              type="text"
              placeholder="Ej: Calle 45 # 12-34, Bogotá"
              value={form.address}
              onChange={handleChange("address")}
              error={errors.address}
              maxLength={50}
            />
            {errors.address && (
              <span className={styles.errorMsg}>{errors.address}</span>
            )}
          </div>

          {/* Descripción (opcional) */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="proj-desc">
              Descripción
              <span
                style={{
                  fontWeight: "var(--font-weight-normal)",
                  color: "var(--color-text-secondary)",
                  marginLeft: "4px",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                (opcional)
              </span>
            </label>
            <textarea
              id="proj-desc"
              className={styles.textarea}
              placeholder="Describe brevemente el proyecto..."
              value={form.description}
              onChange={handleChange("description")}
              maxLength={200}
              rows={3}
            />
            <span className={styles.charCount}>
              {form.description.length} / 200
            </span>
            {errors.description && (
              <span className={styles.errorMsg}>{errors.description}</span>
            )}
          </div>
        </form>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className={styles.footer}>
          <Button
            variant="secondary"
            size="medium"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear proyecto"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
