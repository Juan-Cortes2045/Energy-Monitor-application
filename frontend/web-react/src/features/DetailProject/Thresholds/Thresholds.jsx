import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Info, Check, Lock } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
import styles from "./Thresholds.module.css";

// ── Umbrales por defecto del sistema (ERF3.5). Sirven como base cuando
// el proyecto todavía no tiene umbrales personalizados propios. ────────
const DEFAULT_THRESHOLDS = { daily: 10, monthly: 300 };

const Thresholds = ({ project, isOwner = false }) => {
  const { t } = useTranslation("thresholds");

  const [useDefaults, setUseDefaults] = useState(true);
  const [daily, setDaily] = useState(String(DEFAULT_THRESHOLDS.daily));
  const [monthly, setMonthly] = useState(String(DEFAULT_THRESHOLDS.monthly));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const handleToggleDefaults = () => {
    if (!isOwner) return;
    setUseDefaults((prev) => {
      const next = !prev;
      if (next) {
        setDaily(String(DEFAULT_THRESHOLDS.daily));
        setMonthly(String(DEFAULT_THRESHOLDS.monthly));
        setErrors({});
      }
      return next;
    });
    setSaved(false);
  };

  const handleFieldChange = (setter) => (e) => {
    setter(e.target.value);
    setSaved(false);
  };

  const validate = () => {
    const dailyNum = Number(daily);
    const monthlyNum = Number(monthly);
    const nextErrors = {};

    if (!daily.trim() || Number.isNaN(dailyNum) || dailyNum <= 0) {
      nextErrors.daily = t("errors.invalid");
    }
    if (!monthly.trim() || Number.isNaN(monthlyNum) || monthlyNum <= 0) {
      nextErrors.monthly = t("errors.invalid");
    }
    if (!nextErrors.daily && !nextErrors.monthly && monthlyNum < dailyNum) {
      nextErrors.monthly = t("errors.monthlyLessThanDaily");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (useDefaults) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }
    if (!validate()) return;

    // NOTE: aquí se persistirán los umbrales de este proyecto (ERF3.1)
    // contra el backend cuando esté disponible. Cada proyecto guarda
    // sus propios valores de forma independiente.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
                  useDefaults ? styles.active : styles.inactive
                }`}
              >
                {useDefaults ? t("defaults.on") : t("defaults.off")}
              </span>
              <button
                type="button"
                className={`${styles.switch} ${useDefaults ? styles.switchOn : ""}`}
                onClick={handleToggleDefaults}
                disabled={!isOwner}
                aria-label={t("defaults.label")}
              >
                <span className={styles.thumb} />
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldsGrid}>
            <div className={styles.field}>
              <Input
                id="threshold-daily"
                type="number"
                min="0"
                value={daily}
                onChange={handleFieldChange(setDaily)}
                disabled={useDefaults || !isOwner}
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
                value={monthly}
                onChange={handleFieldChange(setMonthly)}
                disabled={useDefaults || !isOwner}
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

          {isOwner && (
            <div className={styles.actions}>
              <Button variant="primary" onClick={handleSave}>
                {saved ? (
                  <>
                    <Check size={15} className={styles.icon} />
                    {t("buttons.saved")}
                  </>
                ) : (
                  t("buttons.save")
                )}
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
