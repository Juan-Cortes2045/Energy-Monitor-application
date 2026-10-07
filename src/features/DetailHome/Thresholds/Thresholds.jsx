import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import { errorMessage } from "../../../services/http/errorMessages";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Info, Check, Lock } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
import styles from "./Thresholds.module.css";
import { useThresholds } from "../hooks/useThresholds";

/**
 * Umbrales conectados al backend:
 * - GET /homes/{id}/thresholds al montar
 * - PUT /homes/{id}/thresholds al guardar (useSystemDefault pasa a false)
 * - Solo OWNER puede editar; el 403 del servidor se muestra igual.
 */
const Thresholds = ({ home, isOwner = false }) => {
  const { t } = useTranslation("thresholds");
  const homeId = home?.idHome;
  const { thresholds, loading, error, reload, save } = useThresholds(homeId);

  const [daily, setDaily] = useState("");
  const [monthly, setMonthly] = useState("");
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Sincroniza los campos con los valores cargados
  const loadedDaily = thresholds?.dailyLimit;
  const loadedMonthly = thresholds?.monthlyLimit;
  const syncedDaily = daily === "" && loadedDaily != null;
  const syncedMonthly = monthly === "" && loadedMonthly != null;
  const displayDaily = syncedDaily ? String(loadedDaily) : daily;
  const displayMonthly = syncedMonthly ? String(loadedMonthly) : monthly;

  const validate = () => {
    const nextErrors = {};
    const d = Number(displayDaily);
    const m = Number(displayMonthly);
    if (!displayDaily.trim() || Number.isNaN(d) || d <= 0) {
      nextErrors.daily = t("errors.invalid");
    }
    if (!displayMonthly.trim() || Number.isNaN(m) || m <= 0) {
      nextErrors.monthly = t("errors.invalid");
    }
    if (!nextErrors.daily && !nextErrors.monthly && d > m) {
      nextErrors.monthly = t("errors.order");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setServerError(null);
    setSaved(false);
    const err = await save(Number(displayDaily), Number(displayMonthly));
    setSaving(false);
    if (err) {
      setServerError(err);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return <p className={styles.infoNote} role="status">{t("loading")}</p>;
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{t("title")}</h2>
          <p className={styles.sectionSub}>{t("subtitle")}</p>
        </div>
      </div>

      {!isOwner && (
        <div className={styles.readOnlyNotice}>
          <Lock size={14} />
          <span>{t("readOnly.notice")}</span>
        </div>
      )}

      {serverError && (
        <div className={styles.readOnlyNotice} role="alert">
          <span>{errorMessage(t, serverError, "thresholdsUpdate")}</span>
        </div>
      )}

      <Card>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.rowLeft}>
              <div className={styles.rowIcon}>
                <Gauge size={20} />
              </div>
              <div>
                <h4>{t("defaults.label")}</h4>
                <p>{t("defaults.hint")}</p>
              </div>
            </div>

            <div className={styles.rowRight}>
              <span
                className={`${styles.status} ${
                  thresholds?.useSystemDefault ? styles.active : styles.inactive
                }`}
              >
                {thresholds?.useSystemDefault ? t("defaults.on") : t("defaults.off")}
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <Input
                id="threshold-daily"
                type="number"
                min="0"
                value={displayDaily}
                onChange={(e) => setDaily(e.target.value)}
                disabled={!isOwner}
                placeholder="0"
              >
                {t("fields.daily")}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
              {errors.daily && (
                <span className={styles.errorMsg}>{errors.daily}</span>
              )}
            </div>

            <div className={styles.field}>
              <Input
                id="threshold-monthly"
                type="number"
                min="0"
                value={displayMonthly}
                onChange={(e) => setMonthly(e.target.value)}
                disabled={!isOwner}
                placeholder="0"
              >
                {t("fields.monthly")}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
              {errors.monthly && (
                <span className={styles.errorMsg}>{errors.monthly}</span>
              )}
            </div>
          </div>

          {saved && (
            <p role="status" className={styles.saved}>
              <Check size={15} className={styles.icon} />
              {t("buttons.saved")}
            </p>
          )}

          {isOwner && (
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? t("buttons.saving") : t("buttons.save")}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className={styles.infoNote}>
        <Info size={14} />
        <span>{t("scopeNote")}</span>
      </div>
    </div>
  );
};

export default Thresholds;
