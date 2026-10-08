import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Check } from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { APPLIANCE_ICON, ROOM_KEYS, uiApplianceType } from "../../shared/deviceTypes";
import { deviceApi } from "../../../../services/devices";
import { errorMessage } from "../../../../services/http";
// Mismo aspecto que el asistente de vinculación.
import styles from "../LinkDeviceModal/LinkDeviceModal.module.css";

/**
 * Edita qué electrodoméstico mide un módulo ya vinculado, su nombre y su ubicación.
 * No toca el módulo: la key y la red siguen igual.
 */
const EditDeviceModal = ({ homeId, device, onClose, onSaved }) => {
  const { t } = useTranslation("linkDeviceModal");
  const { t: tDevices } = useTranslation("devices");
  const [applianceTypes, setApplianceTypes] = useState([]);
  const [applianceTypeId, setApplianceTypeId] = useState(device.applianceTypeId);
  const [name, setName] = useState(device.name ?? "");
  // Una ubicación escrita a mano (no es una de las claves) se conserva como opción.
  const customRoom = device.location && !ROOM_KEYS.includes(device.location) ? device.location : null;
  const [room, setRoom] = useState(device.location || ROOM_KEYS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    deviceApi
      .listApplianceTypes()
      .then((list) => {
        if (cancelled) return;
        setApplianceTypes(list.map((a) => ({ id: a.idApplianceType, uiType: uiApplianceType(a.name) })));
      })
      .catch((err) => !cancelled && setError(errorMessage(t, err)));
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleSave = async () => {
    if (!applianceTypeId || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await deviceApi.updateDevice(homeId, device.id, {
        name: name.trim(),
        applianceTypeId,
        location: room,
      });
      onSaved?.();
    } catch (err) {
      setError(errorMessage(t, err, "deviceEdit"));
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("edit.title")}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.stepBlock}>
            <p className={styles.stepTitle}>{t("appliance.title")}</p>
            <p className={styles.hint}>{t("edit.hint")}</p>

            <div className={styles.applianceGrid}>
              {applianceTypes.map((appliance) => {
                const Icon = APPLIANCE_ICON[appliance.uiType];
                const isSelected = applianceTypeId === appliance.id;
                return (
                  <button
                    type="button"
                    key={appliance.id}
                    className={`${styles.applianceOption} ${isSelected ? styles.applianceOptionSelected : ""}`}
                    onClick={() => setApplianceTypeId(appliance.id)}
                  >
                    <span className={styles.applianceOptionIcon}>
                      <Icon size={20} />
                    </span>
                    <span className={styles.applianceOptionName}>
                      {tDevices(`applianceTypes.${appliance.uiType}`)}
                    </span>
                    {isSelected && <Check size={14} className={styles.applianceOptionCheck} />}
                  </button>
                );
              })}
            </div>

            <div className={styles.field}>
              <Input
                id="edit-device-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("done.nameLabel")}
                maxLength={50}
              >
                {t("done.nameLabel")}
              </Input>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="edit-device-room">
                {t("done.roomLabel")}
              </label>
              <select
                id="edit-device-room"
                className={styles.select}
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              >
                {customRoom && <option value={customRoom}>{customRoom}</option>}
                {ROOM_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {tDevices(`rooms.${key}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <span className={styles.errorMsg} role="alert">
              {error}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            {t("buttons.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !applianceTypeId || !name.trim()}>
            {t("edit.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditDeviceModal;
