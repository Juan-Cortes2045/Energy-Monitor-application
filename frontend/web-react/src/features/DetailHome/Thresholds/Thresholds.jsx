import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Info, Check, Lock } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import Input from "../../../design/components/Input/Input";
import styles from "./Thresholds.module.css";

const DEFAULT_THRESHOLDS = { daily: 10, monthly: 300 };

const Thresholds = ({ project, isOwner = false }) => {
  const { t } = useTranslation("thresholds");

  const [useDefaults, setUseDefaults] = useState(true);
  const [periodicity, setPeriodicity] = useState("daily");
  const [daily, setDaily] = useState(String(DEFAULT_THRESHOLDS.daily));
  const [monthly, setMonthly] = useState(String(DEFAULT_THRESHOLDS.monthly));
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const isDaily = periodicity === "daily";

  const calculatedValue = useMemo(() => {
    if (isDaily) {
      const num = Number(daily);
      return !daily.trim() || Number.isNaN(num) || num <= 0 ? "" : String(Math.round(num * 30));
    } else {
      const num = Number(monthly);
      return !monthly.trim() || Number.isNaN(num) || num <= 0 ? "" : (num / 30).toFixed(1).replace(/\.0$/, "");
    }
  }, [daily, monthly, isDaily]);

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

  const handlePeriodicityToggle = () => {
    if (!isOwner || useDefaults) return;
    setPeriodicity((prev) => (prev === "daily" ? "monthly" : "daily"));
    setErrors({});
    setSaved(false);
  };

  const handleActiveFieldChange = (e) => {
    if (isDaily) {
      setDaily(e.target.value);
    } else {
      setMonthly(e.target.value);
    }
    setSaved(false);
  };

  const validate = () => {
    const nextErrors = {};
    if (isDaily) {
      const dailyNum = Number(daily);
      if (!daily.trim() || Number.isNaN(dailyNum) || dailyNum <= 0) {
        nextErrors.daily = t("errors.invalid");
      }
    } else {
      const monthlyNum = Number(monthly);
      if (!monthly.trim() || Number.isNaN(monthlyNum) || monthlyNum <= 0) {
        nextErrors.monthly = t("errors.invalid");
      }
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
          {/* Toggle defaults */}
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

          {/* Periodicity selector */}
          {!useDefaults && (
            <>
              <div className={styles.row}>
                <div className={styles.rowLeft}>
                  <div>
                    <h4>{t("periodicity.label")}</h4>
                  </div>
                </div>
                <div className={styles.rowRight}>
                  <span className={styles.periodicityLabel}>
                    {isDaily ? t("periodicity.daily") : t("periodicity.monthly")}
                  </span>
                  <button
                    type="button"
                    className={`${styles.switch} ${!isDaily ? styles.switchOn : ""}`}
                    onClick={handlePeriodicityToggle}
                    disabled={!isOwner}
                    aria-label={t("periodicity.label")}
                  >
                    <span className={styles.thumb} />
                  </button>
                </div>
              </div>

              <div className={styles.divider} />
            </>
          )}

          {/* Threshold fields */}
          <div className={styles.fieldsGrid}>
            {/* Daily field */}
            <div className={styles.field}>
              <Input
                id="threshold-daily"
                type="number"
                min="0"
                value={isDaily ? daily : calculatedValue}
                onChange={isDaily ? handleActiveFieldChange : undefined}
                disabled={useDefaults || !isOwner || !isDaily}
                placeholder="0"
              >
                {t("fields.daily")}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
              {!isDaily && !useDefaults && calculatedValue && (
                <span className={styles.calculatedBadge}>{t("calculated")}</span>
              )}
              {errors.daily && (
                <span className={styles.errorMsg}>{errors.daily}</span>
              )}
            </div>

            {/* Monthly field */}
            <div className={styles.field}>
              <Input
                id="threshold-monthly"
                type="number"
                min="0"
                value={isDaily ? calculatedValue : monthly}
                onChange={!isDaily ? handleActiveFieldChange : undefined}
                disabled={useDefaults || !isOwner || isDaily}
                placeholder="0"
              >
                {t("fields.monthly")}
              </Input>
              <span className={styles.unit}>{t("unit")}</span>
              {isDaily && !useDefaults && calculatedValue && (
                <span className={styles.calculatedBadge}>{t("calculated")}</span>
              )}
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
