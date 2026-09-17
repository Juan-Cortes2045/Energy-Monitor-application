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
import styles from "./Home.module.css";
import { useTranslation } from "react-i18next";
import { deleteHome, leaveHome } from "../../../services/home.service";
import ConfirmModal from "../../../components/shared/ConfirmModal/ConfirmModal";

// Keyed by home_type.name (the stable "house"/"apartment"/"studio"/"other"
// key from the API), not display text — see mock/README.md's *_type.name
// convention.
const HOME_TYPE_ICONS = {
  house: <Home size={12} />,
  apartment: <Building2 size={12} />,
  studio: <Building2 size={12} />,
  other: <Building2 size={12} />,
};

const formatDate = (iso, locale) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
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

const HomeDetail = ({ home, isOwner = false, onLeave, onDelete }) => {
  const { t, i18n } = useTranslation("home");
  const { t: tHomeTypes } = useTranslation("createHomeModal");
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // null | "leave" | "delete"
  const [confirming, setConfirming] = useState(false);

  const ownerName = home.owner ? `${home.owner.name} ${home.owner.last_name}`.trim() : "";

  const handleCopy = () => {
    if (!home.access_code) return;
    navigator.clipboard.writeText(home.access_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      if (confirmAction === "leave") {
        await leaveHome(home.id);
        onLeave?.();
      } else if (confirmAction === "delete") {
        await deleteHome(home.id);
        onDelete?.();
      }
    } finally {
      setConfirming(false);
      setConfirmAction(null);
    }
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
              <span>{home.name || t("placeholders.empty")}</span>
            </Field>

            <Field label={t("fields.homeType")}>
              {home.home_type ? (
                <span className={styles.typeBadge}>
                  {HOME_TYPE_ICONS[home.home_type.name] ?? (
                    <Building2 size={12} />
                  )}
                  {tHomeTypes(`homeTypes.${home.home_type.name}`)}
                </span>
              ) : (
                <span>{t("placeholders.empty")}</span>
              )}
            </Field>

            <Field label={t("fields.address")} fullWidth>
              <span>{home.address || t("placeholders.empty")}</span>
            </Field>

            <Field label={t("fields.description")} fullWidth>
              <span className={styles.textMuted}>
                {home.description || t("placeholders.empty")}
              </span>
            </Field>

            <Field label={t("fields.creationDate")}>
              <span className={styles.textMuted}>
                {formatDate(home.creation_date, i18n.language)}
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
                    {home.access_code || t("placeholders.noCode")}
                  </span>
                  <button
                    type="button"
                    className={`${styles.copyBtn} ${copied ? styles.copyBtnOk : ""}`}
                    onClick={handleCopy}
                    disabled={!home.access_code}
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
              <Button variant="Danger" onClick={() => setConfirmAction("delete")}>
                <Trash2 size={15} className={styles.icon} />
                {t("buttons.deleteHome")}
              </Button>
            ) : (
              <Button variant="Danger" onClick={() => setConfirmAction("leave")}>
                <LogOut size={15} className={styles.icon} />
                {t("buttons.leaveHome")}
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
              {getInitials(ownerName) || <User size={16} />}
            </div>
            <div className={styles.ownerMeta}>
              <span className={styles.ownerName}>
                {ownerName || t("placeholders.empty")}
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
                {home.owner?.email || t("placeholders.empty")}
              </span>
            </Field>
            <Field label={t("fields.phone")}>
              <span className={styles.fieldValueWithIcon}>
                <Phone size={12} aria-hidden="true" />
                {home.owner?.cellphone || t("placeholders.empty")}
              </span>
            </Field>
          </div>
        </div>
      </Card>

      {confirmAction && (
        <ConfirmModal
          title={t(confirmAction === "delete" ? "confirm.deleteTitle" : "confirm.leaveTitle")}
          message={t(confirmAction === "delete" ? "confirm.delete" : "confirm.leave")}
          confirmLabel={t(confirmAction === "delete" ? "buttons.deleteHome" : "buttons.leaveHome")}
          cancelLabel={t("buttons.cancel")}
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          disabled={confirming}
        />
      )}
    </div>
  );
};

export default HomeDetail;
