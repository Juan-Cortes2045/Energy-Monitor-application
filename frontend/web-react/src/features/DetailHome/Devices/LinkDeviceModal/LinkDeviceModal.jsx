import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Search,
  CircuitBoard,
  Wifi,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
  CheckCircle2,
} from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { APPLIANCE_ICON } from "../../shared/deviceTypes";
import styles from "./LinkDeviceModal.module.css";

const STEPS = ["discover", "appliance", "network", "connecting", "done"];


const MOCK_FOUND_DEVICES = [
  { id: "d1", code: "EM-204" },
  { id: "d2", code: "EM-118" },
  { id: "d3", code: "EM-076" },
];

const MOCK_NETWORKS = [
  { id: "n1", ssid: "Casa-Principal", signal: 90, secured: true },
  { id: "n2", ssid: "Casa-Principal-5G", signal: 78, secured: true },
  { id: "n3", ssid: "Red-Invitados", signal: 55, secured: false },
];


const APPLIANCE_TYPES = Object.entries(APPLIANCE_ICON).map(([id, icon]) => ({
  id,
  icon,
}));

const ROOM_KEYS = ["livingRoom", "kitchen", "laundryRoom", "bedroom", "garage", "other"];

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

const SignalBars = ({ signal }) => {
  const bars = signal >= 75 ? 3 : signal >= 45 ? 2 : 1;
  return (
    <span className={styles.signalBars} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`${styles.bar} ${i < bars ? styles.barActive : ""}`}
        />
      ))}
    </span>
  );
};

const LinkDeviceModal = ({ onClose, onAddDevice }) => {
  const { t } = useTranslation("linkDeviceModal");
  const { t: tDevices } = useTranslation("devices");

  const [step, setStep] = useState("discover");
  const [scanning, setScanning] = useState(true);
  const [foundDevices, setFoundDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [selectedAppliance, setSelectedAppliance] = useState(null);

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [connectMessage, setConnectMessage] = useState(0);

  const [deviceName, setDeviceName] = useState("");
  const [room, setRoom] = useState(ROOM_KEYS[0]);

  // ── Simular escaneo de módulos cercanos ───────────────────────────
  useEffect(() => {
    if (step !== "discover" || !scanning) return;
    const timer = setTimeout(() => {
      setFoundDevices(MOCK_FOUND_DEVICES);
      setScanning(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [step, scanning]);

  // ── Simular conexión: avanza mensajes y luego pasa a "done" ───────
  useEffect(() => {
    if (step !== "connecting") return;
    setConnectMessage(0);
    const t1 = setTimeout(() => setConnectMessage(1), 700);
    const t2 = setTimeout(() => setConnectMessage(2), 1500);
    const t3 = setTimeout(() => {
      setDeviceName(
        selectedAppliance
          ? tDevices(`applianceTypes.${selectedAppliance.id}`)
          : "",
      );
      setStep("done");
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handleRescan = () => {
    setFoundDevices([]);
    setSelectedDevice(null);
    setScanning(true);
  };

  const handleGoToAppliance = () => {
    if (!selectedDevice) return;
    setStep("appliance");
  };

  const handleGoToNetwork = () => {
    if (!selectedAppliance) return;
    setStep("network");
  };

  const handleConnect = () => {
    if (selectedNetwork?.secured && !password.trim()) {
      setPasswordError(t("errors.passwordRequired"));
      return;
    }
    setPasswordError("");
    setStep("connecting");
  };

  const handleFinish = () => {
    onAddDevice?.({
      name: deviceName.trim() || tDevices(`applianceTypes.${selectedAppliance?.id ?? "other"}`),
      applianceType: selectedAppliance?.id ?? "other",
      roomKey: room,
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

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
          {/* ── PASO 1: Descubrir el módulo de medición ─────────────── */}
          {step === "discover" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("discover.title")}</p>
              <p className={styles.hint}>{t("discover.hint")}</p>

              {scanning ? (
                <div className={styles.scanningBox}>
                  <span className={styles.pulseWrap}>
                    <span className={styles.pulseRing} />
                    <Wifi size={22} className={styles.scanIcon} />
                  </span>
                  <p className={styles.scanningText}>{t("discover.scanning")}</p>
                </div>
              ) : (
                <>
                  <p className={styles.blockLabel}>{t("discover.foundTitle")}</p>
                  <div className={styles.deviceOptions}>
                    {foundDevices.map((device) => {
                      const isSelected = selectedDevice?.id === device.id;
                      return (
                        <button
                          type="button"
                          key={device.id}
                          className={`${styles.deviceOption} ${
                            isSelected ? styles.deviceOptionSelected : ""
                          }`}
                          onClick={() => setSelectedDevice(device)}
                        >
                          <span className={styles.deviceOptionIcon}>
                            <CircuitBoard size={16} />
                          </span>
                          <span className={styles.deviceOptionName}>
                            {device.code}
                          </span>
                          {isSelected && (
                            <Check size={16} className={styles.deviceOptionCheck} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={handleRescan}
                  >
                    <Search size={13} />
                    {t("discover.rescan")}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── PASO 2: Qué electrodoméstico va a medir ─────────────── */}
          {step === "appliance" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("appliance.title")}</p>
              <p className={styles.hint}>{t("appliance.hint")}</p>

              <div className={styles.applianceGrid}>
                {APPLIANCE_TYPES.map((appliance) => {
                  const Icon = appliance.icon;
                  const isSelected = selectedAppliance?.id === appliance.id;
                  return (
                    <button
                      type="button"
                      key={appliance.id}
                      className={`${styles.applianceOption} ${
                        isSelected ? styles.applianceOptionSelected : ""
                      }`}
                      onClick={() => setSelectedAppliance(appliance)}
                    >
                      <span className={styles.applianceOptionIcon}>
                        <Icon size={20} />
                      </span>
                      <span className={styles.applianceOptionName}>
                        {tDevices(`applianceTypes.${appliance.id}`)}
                      </span>
                      {isSelected && (
                        <Check size={14} className={styles.applianceOptionCheck} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── PASO 3: Red WiFi ────────────────────────────────────── */}
          {step === "network" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("network.title")}</p>
              <p className={styles.hint}>{t("network.subtitle")}</p>

              <div className={styles.networkOptions}>
                {MOCK_NETWORKS.map((network) => {
                  const isSelected = selectedNetwork?.id === network.id;
                  return (
                    <button
                      type="button"
                      key={network.id}
                      className={`${styles.networkOption} ${
                        isSelected ? styles.deviceOptionSelected : ""
                      }`}
                      onClick={() => {
                        setSelectedNetwork(network);
                        setPasswordError("");
                      }}
                    >
                      <SignalBars signal={network.signal} />
                      <span className={styles.networkName}>{network.ssid}</span>
                      {network.secured ? (
                        <Lock size={13} className={styles.lockIcon} />
                      ) : (
                        <span className={styles.openTag}>{t("network.open")}</span>
                      )}
                      {isSelected && (
                        <Check size={16} className={styles.deviceOptionCheck} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedNetwork?.secured && (
                <div className={styles.field}>
                  <Input
                    id="wifi-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder={t("network.passwordPlaceholder")}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    icon={
                      showPassword ? <EyeOff size={16} /> : <Eye size={16} />
                    }
                    onIconClick={() => setShowPassword((v) => !v)}
                  >
                    {t("network.passwordLabel")}
                  </Input>
                  {passwordError && (
                    <span className={styles.errorMsg}>{passwordError}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 4: Conectando ──────────────────────────────────── */}
          {step === "connecting" && (
            <div className={styles.stepBlock}>
              <div className={styles.connectingBox}>
                <Loader2 size={32} className={styles.spinner} />
                <p className={styles.stepTitle}>{t("connecting.title")}</p>

                <ul className={styles.connectingList}>
                  <li className={connectMessage >= 0 ? styles.connectingDone : ""}>
                    {connectMessage > 0 ? <Check size={13} /> : <span className={styles.dot} />}
                    {t("connecting.step1", { ssid: selectedNetwork?.ssid ?? "" })}
                  </li>
                  <li className={connectMessage >= 1 ? styles.connectingDone : ""}>
                    {connectMessage > 1 ? <Check size={13} /> : <span className={styles.dot} />}
                    {t("connecting.step2")}
                  </li>
                  <li className={connectMessage >= 2 ? styles.connectingDone : ""}>
                    <span className={styles.dot} />
                    {t("connecting.step3")}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ── PASO 5: Listo ───────────────────────────────────────── */}
          {step === "done" && (
            <div className={styles.stepBlock}>
              <div className={styles.doneBox}>
                <CheckCircle2 size={40} className={styles.doneIcon} />
                <p className={styles.stepTitle}>{t("done.title")}</p>
                <p className={styles.hint}>{t("done.subtitle")}</p>
              </div>

              <div className={styles.field}>
                <Input
                  id="device-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t("done.nameLabel")}
                  maxLength={40}
                >
                  {t("done.nameLabel")}
                </Input>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>{t("done.roomLabel")}</label>
                <select
                  className={styles.select}
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                >
                  {ROOM_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {tDevices(`rooms.${key}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {step === "discover" && (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleGoToAppliance}
                disabled={!selectedDevice}
              >
                {t("buttons.continue")}
              </Button>
            </>
          )}

          {step === "appliance" && (
            <>
              <Button variant="secondary" onClick={() => setStep("discover")}>
                {t("buttons.back")}
              </Button>
              <Button
                variant="primary"
                onClick={handleGoToNetwork}
                disabled={!selectedAppliance}
              >
                {t("buttons.continue")}
              </Button>
            </>
          )}

          {step === "network" && (
            <>
              <Button variant="secondary" onClick={() => setStep("appliance")}>
                {t("buttons.back")}
              </Button>
              <Button
                variant="primary"
                onClick={handleConnect}
                disabled={!selectedNetwork}
              >
                {t("buttons.connect")}
              </Button>
            </>
          )}

          {step === "connecting" && (
            <Button variant="secondary" onClick={onClose}>
              {t("buttons.cancel")}
            </Button>
          )}

          {step === "done" && (
            <Button variant="primary" onClick={handleFinish}>
              {t("buttons.finish")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinkDeviceModal;
