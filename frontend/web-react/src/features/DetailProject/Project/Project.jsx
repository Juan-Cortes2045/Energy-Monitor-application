import { useState } from "react";
import {
  Building2,
  Home,
  Key,
  User,
  Mail,
  Phone,
  Copy,
  Trash2,
  LogOut,
  Check,
} from "lucide-react";
import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import styles from "./Project.module.css";

const emptyProject = {
  project_code: "",
  name: "",
  address: "",
  projectType: "", // ProjectType.name
  access_code: "", // visible solo para RESPONSIBLE
  description: "",
  creation_date: null,
  responsible: { name: "", email: "", cellphone: "" },
};

const PROJECT_TYPE_ICONS = {
  Casa: <Home size={12} />,
  Apartamento: <Building2 size={12} />,
  "Apta estudio": <Building2 size={12} />,
  Oficina: <Building2 size={12} />,
  Local: <Building2 size={12} />,
  Otro: <Building2 size={12} />,
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const Field = ({ label, fullWidth = false, children }) => (
  <div className={`${styles.field} ${fullWidth ? styles.fieldFull : ""}`}>
    <span className={styles.fieldLabel}>{label}</span>
    <div className={styles.fieldValue}>{children}</div>
  </div>
);

const Project = ({ project, isOwner = false, onLeave, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const data = emptyProject;

  const handleCopy = () => {
    if (!data.access_code) return;
    navigator.clipboard.writeText(data.access_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = () => {
    if (window.confirm("¿Seguro que deseas salirte de este proyecto?")) {
      onLeave?.(); // TODO: DELETE /projects/:id/users/me
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "¿Eliminar este proyecto? Esta acción no se puede deshacer.",
      )
    ) {
      onDelete?.(); // TODO: DELETE /projects/:id
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.cardInner}>
          {/* Título de sección */}
          <p className={styles.cardTitle}>
            <Building2 size={14} aria-hidden="true" />
            Información del proyecto
          </p>

          {/* Grid de campos */}
          <div className={styles.fieldGrid}>
            <Field label="Nombre">
              <span>{data.name || "—"}</span>
            </Field>

            <Field label="Tipo de proyecto">
              {data.projectType ? (
                <span className={styles.typeBadge}>
                  {PROJECT_TYPE_ICONS[data.projectType] ?? (
                    <Building2 size={12} />
                  )}
                  {data.projectType}
                </span>
              ) : (
                <span>—</span>
              )}
            </Field>

            <Field label="Dirección" fullWidth>
              <span>{data.address || "—"}</span>
            </Field>

            <Field label="Descripción" fullWidth>
              <span className={styles.textMuted}>
                {data.description || "—"}
              </span>
            </Field>

            <Field label="Fecha de creación">
              <span className={styles.textMuted}>
                {formatDate(data.creation_date)}
              </span>
            </Field>
          </div>

          <div className={styles.divider} />

          {/* Código de acceso */}
          <div className={styles.accessSection}>
            {isOwner ? (
              <>
                <p className={styles.sectionSubtitle}>
                  <Key size={13} aria-hidden="true" />
                  Código de acceso
                </p>
                <p className={styles.hint}>
                  Comparte este código para que otros usuarios puedan unirse.
                </p>
                <div className={styles.codeBox}>
                  <span className={styles.codeText}>
                    {data.access_code || "——————"}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyBtn} ${copied ? styles.copyBtnOk : ""}`}
                    onClick={handleCopy}
                    disabled={!data.access_code}
                    aria-label="Copiar código de acceso"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </>
            ) : /* El miembro común no ve el código */
            null}
          </div>

          {/* Botón de acción — dentro de la card */}
          <div className={styles.actionRow}>
            {isOwner ? (
              <Button variant="Danger" onClick={handleDelete}>
                <Trash2 size={15} className={styles.icon} />
                Eliminar proyecto
              </Button>
            ) : (
              <Button variant="Danger" onClick={handleLeave}>
                <LogOut size={15} className={styles.icon} />
                Salirse del proyecto
              </Button>
            )}
          </div>
        </div>
      </Card>
      <Card>
        <div className={styles.cardInner}>
          <p className={styles.cardTitle}>
            <User size={14} aria-hidden="true" />
            Usuario responsable
          </p>

          <div className={styles.ownerRow}>
            <div className={styles.ownerAvatar}>
              {getInitials(data.responsible.name) || <User size={16} />}
            </div>
            <div className={styles.ownerMeta}>
              <span className={styles.ownerName}>
                {data.responsible.name || "—"}
              </span>
              <span className={styles.ownerBadge}>Responsable</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldGrid}>
            <Field label="Correo">
              <span className={styles.fieldValueWithIcon}>
                <Mail size={12} aria-hidden="true" />
                {data.responsible.email || "—"}
              </span>
            </Field>
            <Field label="Teléfono">
              <span className={styles.fieldValueWithIcon}>
                <Phone size={12} aria-hidden="true" />
                {data.responsible.cellphone || "—"}
              </span>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Project;
