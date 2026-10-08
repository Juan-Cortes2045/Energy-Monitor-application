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

const DAYS_PER_MONTH = 30;
const round = (n) => Math.round(n * 100) / 100;

/**
 * Umbrales conectados al backend:
 * - GET /homes/{id}/thresholds al montar
 * - PUT /homes/{id}/thresholds al guardar: un solo límite (diario o mensual) y el
 *   otro lo deriva el backend a 30 días por mes; useSystemDefault pasa a false
 * - Solo OWNER puede editar; el 403 del servidor se muestra igual.
 */
const Thresholds = ({ home, isOwner = false }) => {
  const { t } = useTranslation("thresholds");
  const homeId = home?.idHome;
  const { thresholds, loading, error, reload, save } = useThresholds(homeId);

  const [period, setPeriod] = useState(null); // null = el guardado
  const [value, setValue] = useState(null); // null = el guardado
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  // El propietario fija uno de los dos límites; el otro se calcula (30 días por mes).
  const activePeriod = period ?? thresholds?.limitPeriod ?? "DAILY";
  const storedValue =
    activePeriod === "DAILY" ? thresholds?.dailyLimit : thresholds?.monthlyLimit;
  const displayValue = value ?? (storedValue != null ? String(round(storedValue)) : "");
  const numeric = Number(displayValue);
  const derived =
    displayValue.trim() && !Number.isNaN(numeric) && numeric > 0
      ? activePeriod === "DAILY"
        ? round(numeric * DAYS_PER_MONTH)
        : round(numeric / DAYS_PER_MONTH)
      : null;

  const choosePeriod = (next) => {
    if (next === activePeriod) return;
    // Al cambiar de periodo se parte del valor equivalente, para no perder lo escrito.
    if (derived != null) setValue(String(derived));
    else setValue(null);
    setPeriod(next);
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};
    if (!displayValue.trim() || Number.isNaN(numeric) || numeric <= 0) {
      nextErrors.value = t("errors.invalid");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setServerError(null);
    setSaved(false);
    const err = await save(activePeriod, numeric);
    setSaving(false);
    if (err) {
      setServerError(err);
      return;
    }
    setPeriod(null);
    setValue(null);
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

          <div className={styles.field}>
            <span className={styles.label}>{t("periodicity.label")}</span>
            <div className={styles.periodToggle} role="radiogroup" aria-label={t("periodicity.label")}>
              {["DAILY", "MONTHLY"].map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={activePeriod === option}
                  className={`${styles.periodOption} ${activePeriod === option ? styles.periodOptionActive : ""}`}
                  onClick={() => choosePeriod(option)}
                  disabled={!isOwner}
                >
                  {t(option === "DAILY" ? "periodicity.daily" : "periodicity.monthly")}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <Input
                id="threshold-value"
                type="number"
                min="0"
                step="any"
                value={displayValue}
                onChange={(e) => setValue(e.target.value)}
                disabled={!isOwner}
                placeholder="0"
              >
                {t(activePeriod === "DAILY" ? "fields.daily" : "fields.monthly")}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
              {errors.value && <span className={styles.errorMsg}>{errors.value}</span>}
            </div>

            <div className={styles.field}>
              <Input
                id="threshold-derived"
                type="number"
                value={derived ?? ""}
                disabled
                readOnly
                placeholder="—"
              >
                {`${t(activePeriod === "DAILY" ? "fields.monthly" : "fields.daily")} (${t("calculated")})`}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
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
