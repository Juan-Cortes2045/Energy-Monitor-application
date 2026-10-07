import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  Key,
  User,
  Mail,
  Copy,
  LogOut,
  Check,
} from "lucide-react";
import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";
import { HOME_TYPES } from "../../shared/homeTypes";
import styles from "./Home.module.css";
import { useTranslation } from "react-i18next";
import { getCurrentPerson } from "../../../services/auth/session";
import { useHomes } from "../../../context/useHomes";

const HOME_TYPE_ICONS = {
  house: <Home size={12} />,
  apartment: <Building2 size={12} />,
  studio: <Building2 size={12} />,
  country_house: <Home size={12} />,
  cabin: <Home size={12} />,
  other: <Building2 size={12} />,
};
const DEFAULT_HOME_TYPE_ICON = <Building2 size={12} />;

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// El backend separa `name` y `lastName`; las iniciales se siguen tomando de los
// dos para no perder la que aportaba el apellido dentro del nombre completo.
const getInitials = (name = "", lastName = "") =>
  [name, lastName]
    .map((word) => word.trim().split(" ")[0]?.[0]?.toUpperCase() ?? "")
    .join("");

const Field = ({ label, fullWidth = false, children }) => (
  <div className={`${styles.field} ${fullWidth ? styles.fieldFull : ""}`}>
    <span className={styles.fieldLabel}>{label}</span>
    <div className={styles.fieldValue}>{children}</div>
  </div>
);

/**
 * Detalle de hogar conectado al backend.
 * - accessCode y creationDate vienen de GET /homes.
 * - Abandonar llama a DELETE /homes/{id}/members/me.
 * - Eliminar hogar no existe en la API (brecha reportada): no se muestra.
 */
const HomeDetail = ({ home, isOwner = false }) => {
  const { t } = useTranslation("home");
  const { t: tTypes } = useTranslation("createHomeModal");
  const { leaveHome } = useHomes();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaveError, setLeaveError] = useState(null);
  const [leaving, setLeaving] = useState(false);

  const typeKey = HOME_TYPES.find((type) => type.id === home?.homeTypeId)?.key;
  const typeLabel = typeKey ? tTypes(`homeTypes.${typeKey}`) : "";

  // El backend manda al responsable en userResponsible*; si faltan y el usuario en
  // sesión es el responsable, se usan sus datos de sesión.
  const me = home?.role === "OWNER" ? getCurrentPerson() : null;
  const data = {
    name: home?.name ?? "",
    address: home?.address ?? "",
    description: home?.description ?? "",
    access_code: home?.accessCode ?? "",
    creation_date: home?.creationDate ?? null,
    responsible: {
      name: home?.userResponsible || me?.name || "",
      lastName: home?.userResponsibleLastName || me?.lastName || "",
      email: home?.userResponsibleEmail || me?.email || "",
    },
  };

  const responsibleName = [data.responsible.name, data.responsible.lastName]
    .filter(Boolean)
    .join(" ");

  const handleCopy = () => {
    if (!data.access_code) return;
    navigator.clipboard.writeText(data.access_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = async () => {
    setConfirming(false);
    setLeaving(true);
    setLeaveError(null);
    const err = await leaveHome(home.idHome);
    setLeaving(false);
    if (err) {
      // 409: el único OWNER no puede abandonar el hogar
      setLeaveError(err);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.cardInner}>
          <p className={styles.cardTitle}>
            <Building2 size={14} aria-hidden="true" />
            {t("title.homeInfo")}
          </p>

          <div className={styles.fieldGrid}>
            <Field label={t("fields.name")}>
              <span>{data.name || t("placeholders.empty")}</span>
            </Field>

            <Field label={t("fields.homeType")}>
              {typeLabel ? (
                <span className={styles.typeBadge}>
                  {HOME_TYPE_ICONS[typeKey] ?? DEFAULT_HOME_TYPE_ICON}
                  {typeLabel}
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

          {leaveError && (
            <p className={styles.errorText} role="alert">
              {leaveError.status === 409
                ? t("errors.lastOwner")
                : leaveError.message}
            </p>
          )}

          <div className={styles.actionRow}>
            <Button
              variant="Danger"
              onClick={() => setConfirming(true)}
              disabled={leaving}
            >
              <LogOut size={15} className={styles.icon} />
              {leaving ? t("buttons.leaving") : t("buttons.leaveHome")}
            </Button>
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
              {getInitials(
                data.responsible.name,
                data.responsible.lastName,
              ) || <User size={16} />}
            </div>
            <div className={styles.ownerMeta}>
              <span className={styles.ownerName}>
                {responsibleName || t("placeholders.empty")}
              </span>
              <span className={styles.ownerBadge}>
                {t("status.responsible")}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldGrid}>
            <Field label={t("fields.email")} fullWidth>
              <span className={styles.fieldValueWithIcon}>
                <Mail size={12} aria-hidden="true" />
                {data.responsible.email || t("placeholders.empty")}
              </span>
            </Field>
          </div>
        </div>
      </Card>

      {confirming && (
        <ConfirmModal
          title={t("confirm.leaveTitle")}
          message={t("confirm.leave")}
          confirmLabel={t("buttons.leaveHome")}
          cancelLabel={t("confirm.cancel")}
          onConfirm={handleLeave}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

export default HomeDetail;
