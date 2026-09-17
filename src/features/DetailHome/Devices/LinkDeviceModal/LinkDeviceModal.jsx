import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Loader2, CheckCircle2, FlaskConical, Check } from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { APPLIANCE_ICON } from "../../shared/deviceTypes";
import { ROOM_KEYS } from "../../shared/roomTypes";
import { useApplianceTypes } from "../../shared/useApplianceTypes";
import { linkDevice, listSpareDevices } from "../../../../services/device.service";
import styles from "./LinkDeviceModal.module.css";

const STEPS = ["enter-code", "assign-details", "connecting", "done"];
const CODE_LENGTH = 6;

const StepDots = ({ current }) => (
  <div className={styles.stepDots}>
    {STEPS.map((step, i) => (
      <span
        key={step}
        className={`${styles.stepDot} ${
          STEPS.indexOf(current) >= i ? styles.stepDotActive : ""
        }`}
      />
    ))}
  </div>
);

// Real devices have no display and can't self-report what appliance they
// monitor — a person has to assign that, plus the room, at the moment of
// installing/linking each one. So "done" always echoes back whatever was
// just chosen and sent in the same request, not something pre-provisioned
// server-side (see mock/server.js's POST /api/homes/:id/devices validation
// and mock/add-spare-devices.js, where an unlinked device starts out with
// both fields null).
const LinkDeviceModal = ({ homeId, onClose, onLinked }) => {
  const { t } = useTranslation("linkDeviceModal");
  const { t: tDevices } = useTranslation("devices");
  const { byId, nameOf } = useApplianceTypes();

  const [step, setStep] = useState("enter-code");
  const [code, setCode] = useState("");
  const [applianceTypeId, setApplianceTypeId] = useState(null);
  const [roomLocation, setRoomLocation] = useState("");
  const [error, setError] = useState("");
  const [linkedDevice, setLinkedDevice] = useState(null);
  const [spareDevices, setSpareDevices] = useState([]);

  // Testing convenience only (see mock/README.md): lets a tester pick a
  // known-unlinked device's code instead of having to already know it.
  // Real users will read this code off their physical module instead —
  // this list is not part of the simulated real-world flow, just a way to
  // learn a valid code for it.
  useEffect(() => {
    let active = true;
    listSpareDevices()
      .then((devices) => {
        if (active) setSpareDevices(devices);
      })
      .catch(() => {
        if (active) setSpareDevices([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH));
    if (error) setError("");
  };

  const handleCodeContinue = () => {
    if (!code.trim()) {
      setError(t("errors.required"));
      return;
    }
    if (code.length !== CODE_LENGTH) {
      setError(t("errors.invalid"));
      return;
    }
    setError("");
    setStep("assign-details");
  };

  const handleConnect = async () => {
    if (!applianceTypeId || !roomLocation) return;
    setStep("connecting");
    try {
      const device = await linkDevice(homeId, { deviceCode: code, applianceTypeId, location: roomLocation });
      setLinkedDevice(device);
      setStep("done");
    } catch (err) {
      setStep("enter-code");
      setError(
        err.code === "DEVICE_NOT_FOUND"
          ? t("errors.notFound")
          : err.code === "DEVICE_ALREADY_LINKED"
            ? t("errors.alreadyLinked")
            : err.message,
      );
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const handlePickSpare = (deviceCode) => {
    setCode(deviceCode);
    if (error) setError("");
  };

  const applianceKey = linkedDevice ? nameOf(linkedDevice.appliance_type_id) : null;
  const ApplianceIcon = applianceKey ? APPLIANCE_ICON[applianceKey] : null;

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t("title")}</h2>
            <StepDots current={step} />
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("close")}
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {step === "enter-code" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("enterCode.title")}</p>
              <p className={styles.hint}>{t("enterCode.hint")}</p>

              <div className={styles.field}>
                <Input
                  id="device-code"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder={t("enterCode.placeholder")}
                  maxLength={CODE_LENGTH}
                >
                  {t("enterCode.label")}
                </Input>
                {error && <span className={styles.errorMsg}>{error}</span>}
              </div>

              {spareDevices.length > 0 && (
                <>
                  <p className={styles.blockLabel}>
                    <FlaskConical size={12} style={{ verticalAlign: "-2px", marginRight: 4 }} />
                    {t("testDevices.title")}
                  </p>
                  <p className={styles.hint}>{t("testDevices.hint")}</p>
                  <div className={styles.deviceOptions}>
                    {spareDevices.map((device) => {
                      const key = nameOf(device.appliance_type_id);
                      const Icon = APPLIANCE_ICON[key] ?? APPLIANCE_ICON.other;
                      return (
                        <button
                          type="button"
                          key={device.id}
                          className={`${styles.deviceOption} ${code === device.device_code ? styles.deviceOptionSelected : ""}`}
                          onClick={() => handlePickSpare(device.device_code)}
                        >
                          <span className={styles.deviceOptionIcon}>
                            <Icon size={16} />
                          </span>
                          <span className={styles.deviceOptionName}>
                            {device.device_code} · {device.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {step === "assign-details" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("assignDetails.title")}</p>
              <p className={styles.hint}>{t("assignDetails.hint")}</p>

              <div className={styles.field}>
                <p className={styles.label}>{t("assignDetails.applianceLabel")}</p>
                <div className={styles.applianceGrid}>
                  {Object.entries(byId).map(([id, name]) => {
                    const Icon = APPLIANCE_ICON[name] ?? APPLIANCE_ICON.other;
                    const selected = applianceTypeId === id;
                    return (
                      <button
                        type="button"
                        key={id}
                        className={`${styles.applianceOption} ${selected ? styles.applianceOptionSelected : ""}`}
                        onClick={() => setApplianceTypeId(id)}
                      >
                        {selected && <Check size={14} className={styles.applianceOptionCheck} />}
                        <span className={styles.applianceOptionIcon}>
                          <Icon size={18} />
                        </span>
                        <span className={styles.applianceOptionName}>
                          {tDevices(`applianceTypes.${name}`)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="device-location">
                  {t("assignDetails.locationLabel")}
                </label>
                <select
                  id="device-location"
                  className={styles.select}
                  value={roomLocation}
                  onChange={(e) => setRoomLocation(e.target.value)}
                >
                  <option value="" disabled>
                    {t("assignDetails.locationPlaceholder")}
                  </option>
                  {ROOM_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tDevices(`rooms.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === "connecting" && (
            <div className={styles.stepBlock}>
              <div className={styles.connectingBox}>
                <Loader2 size={32} className={styles.spinner} />
                <p className={styles.stepTitle}>{t("connecting.title")}</p>
              </div>
            </div>
          )}

          {step === "done" && linkedDevice && (
            <div className={styles.stepBlock}>
              <div className={styles.doneBox}>
                <CheckCircle2 size={40} className={styles.doneIcon} />
                <p className={styles.stepTitle}>{t("done.title")}</p>
                <p className={styles.hint}>{t("done.subtitle")}</p>
              </div>

              <div className={styles.field}>
                <p className={styles.label}>{t("done.nameLabel")}</p>
                <p>{linkedDevice.name}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.label}>{t("done.typeLabel")}</p>
                <p>
                  {ApplianceIcon && <ApplianceIcon size={16} />}{" "}
                  {tDevices(`applianceTypes.${applianceKey}`)}
                </p>
              </div>
              <div className={styles.field}>
                <p className={styles.label}>{t("done.locationLabel")}</p>
                <p>{tDevices(`rooms.${linkedDevice.location}`)}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {step === "enter-code" && (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button variant="primary" onClick={handleCodeContinue}>
                {t("buttons.continue")}
              </Button>
            </>
          )}

          {step === "assign-details" && (
            <>
              <Button variant="secondary" onClick={() => setStep("enter-code")}>
                {t("buttons.back")}
              </Button>
              <Button variant="primary" onClick={handleConnect} disabled={!applianceTypeId || !roomLocation}>
                {t("buttons.continue")}
              </Button>
            </>
          )}

          {step === "connecting" && (
            <Button variant="secondary" onClick={onClose}>
              {t("buttons.cancel")}
            </Button>
          )}

          {step === "done" && (
            <Button variant="primary" onClick={() => onLinked?.()}>
              {t("buttons.finish")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkDeviceModal;
