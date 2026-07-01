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
import { useTranslation } from "react-i18next";

const emptyProject = {
  project_code: "",
  name: "",
  address: "",
  projectType: "",
  access_code: "",
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
  const { t } = useTranslation("project");
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
    if (window.confirm(t("confirm.leave"))) {
      onLeave?.();
    }
  };

  const handleDelete = () => {
    if (window.confirm(t("confirm.delete"))) {
      onDelete?.();
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.cardInner}>
          <p className={styles.cardTitle}>
            <Building2 size={14} aria-hidden="true" />
            {t("title.projectInfo")}
          </p>

          <div className={styles.fieldGrid}>
            <Field label={t("fields.name")}>
              <span>{data.name || t("placeholders.empty")}</span>
            </Field>

            <Field label={t("fields.projectType")}>
              {data.projectType ? (
                <span className={styles.typeBadge}>
                  {PROJECT_TYPE_ICONS[data.projectType] ?? (
                    <Building2 size={12} />
                  )}
                  {data.projectType}
                </span>
              ) : (
                <span>{t("placeholders.empty")}</span>
              )}
            </Field>

            <Field label={t("fields.address")} fullWidth>
              <span>{data.address || t("placeholders.empty")}</span>
            </Field>

            <Field label={t("fields.description")} fullWidth>
              <span className={styles.textMuted}>
                {data.description || t("placeholders.empty")}
              </span>
            </Field>

            <Field label={t("fields.creationDate")}>
              <span className={styles.textMuted}>
                {formatDate(data.creation_date)}
              </span>
            </Field>
          </div>

          <div className={styles.divider} />

          <div className={styles.accessSection}>
            {isOwner ? (
              <>
                <p className={styles.sectionSubtitle}>
                  <Key size={13} aria-hidden="true" />
                  {t("title.accessCode")}
                </p>
                <p className={styles.hint}>{t("hints.accessCode")}</p>

                <div className={styles.codeBox}>
                  <span className={styles.codeText}>
                    {data.access_code || t("placeholders.noCode")}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyBtn} ${copied ? styles.copyBtnOk : ""}`}
                    onClick={handleCopy}
                    disabled={!data.access_code}
                    aria-label={t("buttons.copy")}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </>
            ) : null}
          </div>

          <div className={styles.actionRow}>
            {isOwner ? (
              <Button variant="Danger" onClick={handleDelete}>
                <Trash2 size={15} className={styles.icon} />
                {t("buttons.deleteProject")}
              </Button>
            ) : (
              <Button variant="Danger" onClick={handleLeave}>
                <LogOut size={15} className={styles.icon} />
                {t("buttons.leaveProject")}
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className={styles.cardInner}>
          <p className={styles.cardTitle}>
            <User size={14} aria-hidden="true" />
            {t("title.owner")}
          </p>

          <div className={styles.ownerRow}>
            <div className={styles.ownerAvatar}>
              {getInitials(data.responsible.name) || <User size={16} />}
            </div>
            <div className={styles.ownerMeta}>
              <span className={styles.ownerName}>
                {data.responsible.name || t("placeholders.empty")}
              </span>
              <span className={styles.ownerBadge}>
                {t("status.responsible")}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldGrid}>
            <Field label={t("fields.email")}>
              <span className={styles.fieldValueWithIcon}>
                <Mail size={12} aria-hidden="true" />
                {data.responsible.email || t("placeholders.empty")}
              </span>
            </Field>
            <Field label={t("fields.phone")}>
              <span className={styles.fieldValueWithIcon}>
                <Phone size={12} aria-hidden="true" />
                {data.responsible.cellphone || t("placeholders.empty")}
              </span>
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Project;
