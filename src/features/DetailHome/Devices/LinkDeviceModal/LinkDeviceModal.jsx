import { useEffect, useRef, useState } from "react";
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
  AlertTriangle,
  Bluetooth,
} from "lucide-react";

import Button from "../../../../design/components/Button/Button";
import Input from "../../../../design/components/Input/Input";
import { APPLIANCE_ICON, ROOM_KEYS, uiApplianceType } from "../../shared/deviceTypes";
import {
  connectModule,
  deviceApi,
  isBluetoothSupported,
  needsLinuxBluetoothFlag,
  signalPercent,
} from "../../../../services/devices";
import { errorMessage } from "../../../../services/http";
import styles from "./LinkDeviceModal.module.css";

const STEPS = ["discover", "appliance", "network", "connecting", "done"];

// Progreso de la conexión: cada estado del módulo cierra los pasos anteriores.
const PROGRESS = {
  registering: 0,
  sending: 1,
  wifi_connecting: 1,
  wifi_ok: 2,
  mqtt_connecting: 2,
  mqtt_ok: 3,
};

const StepDots = ({ current }) => (
  <div className={styles.stepDots}>
    {STEPS.map((step, i) => (
      <span
        key={step}
        className={`${styles.stepDot} ${STEPS.indexOf(current) >= i ? styles.stepDotActive : ""}`}
      />
    ))}
  </div>
);

const SignalBars = ({ signal }) => {
  const bars = signal >= 75 ? 3 : signal >= 45 ? 2 : 1;
  return (
    <span className={styles.signalBars} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`${styles.bar} ${i < bars ? styles.barActive : ""}`} />
      ))}
    </span>
  );
};

const LinkDeviceModal = ({ homeId, onClose, onLinked }) => {
  const { t } = useTranslation("linkDeviceModal");
  const { t: tDevices } = useTranslation("devices");
  const supported = isBluetoothSupported();
  const linuxFlag = needsLinuxBluetoothFlag();

  const [step, setStep] = useState("discover");
  const [error, setError] = useState("");

  // Paso 1: módulo
  const sessionRef = useRef(null);
  const [module, setModule] = useState(null); // { code, name }
  const [connectingBle, setConnectingBle] = useState(false);

  // Paso 2: electrodoméstico
  const [applianceTypes, setApplianceTypes] = useState([]);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [deviceName, setDeviceName] = useState("");
  const [room, setRoom] = useState(ROOM_KEYS[0]);

  // Paso 3: red
  const [networks, setNetworks] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [manualSsid, setManualSsid] = useState("");
  const [manual, setManual] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Paso 4: progreso
  const [progress, setProgress] = useState(0);

  // Catálogo de electrodomésticos del backend, con la clave de la UI.
  useEffect(() => {
    let cancelled = false;
    deviceApi
      .listApplianceTypes()
      .then((list) => {
        if (cancelled) return;
        setApplianceTypes(
          list.map((a) => ({ id: a.idApplianceType, uiType: uiApplianceType(a.name) })),
        );
      })
      .catch((err) => !cancelled && setError(errorMessage(t, err)));
    return () => {
      cancelled = true;
    };
  }, [t]);

  // Al cerrar el modal se suelta la conexión Bluetooth.
  useEffect(() => () => sessionRef.current?.disconnect(), []);

  const ssid = manual ? manualSsid.trim() : (selectedNetwork?.ssid ?? "");
  const needsPassword = manual || !!selectedNetwork?.secured;

  // ── Paso 1 ─────────────────────────────────────────────────────────
  const handleSearch = async () => {
    setError("");
    setConnectingBle(true);
    try {
      sessionRef.current?.disconnect();
      const session = await connectModule();
      sessionRef.current = session;
      setModule({ code: session.identity.code, name: session.name });
    } catch (err) {
      // El usuario cerró el selector sin elegir: no es un error.
      if (err?.name !== "NotFoundError") setError(t("errors.bluetooth"));
    } finally {
      setConnectingBle(false);
    }
  };

  // ── Paso 3 ─────────────────────────────────────────────────────────
  const scan = async () => {
    setScanning(true);
    setError("");
    try {
      const list = await sessionRef.current.scanNetworks();
      setNetworks(list);
      if (list.length === 0) setManual(true);
    } catch {
      setError(t("errors.bluetooth"));
    } finally {
      setScanning(false);
    }
  };

  const goToNetwork = () => {
    if (!selectedAppliance || !deviceName.trim()) return;
    setStep("network");
    if (networks.length === 0) scan();
  };

  // ── Paso 4 ─────────────────────────────────────────────────────────
  const handleConnect = async () => {
    if (!ssid) return;
    if (needsPassword && !manual && !password) {
      setError(t("errors.passwordRequired"));
      return;
    }
    setError("");
    setStep("connecting");
    setProgress(PROGRESS.registering);
    const session = sessionRef.current;

    let linked;
    try {
      linked = await deviceApi.linkDevice(homeId, {
        deviceCode: module.code,
        name: deviceName.trim(),
        applianceTypeId: selectedAppliance.id,
        location: room,
      });
    } catch (err) {
      setError(errorMessage(t, err, "deviceLink"));
      setStep("network");
      return;
    }
    if (!linked.broker?.host) {
      setError(t("errors.noBroker"));
      setStep("network");
      return;
    }

    const failed = (status) =>
      status.startsWith("wifi_failed") || status.startsWith("mqtt_failed") || status === "bad_config";
    const off = session.onStatus((status) => {
      if (status in PROGRESS) setProgress(PROGRESS[status]);
    });
    try {
      setProgress(PROGRESS.sending);
      const result = session.waitFor((s) => s === "mqtt_ok" || failed(s), 90000);
      await session.sendConfig({
        ssid,
        pass: password,
        host: linked.broker.host,
        port: linked.broker.port,
        id: linked.device.idDevice,
        key: linked.apiKey,
      });
      const status = await result;
      if (status === "mqtt_ok") {
        setProgress(PROGRESS.mqtt_ok);
        setStep("done");
        return;
      }
      setError(
        status === "wifi_failed:auth"
          ? t("errors.wifiAuth")
          : status === "wifi_failed:notfound"
            ? t("errors.wifiNotFound")
            : status.startsWith("wifi_failed")
              ? t("errors.wifiFailed")
              : t("errors.broker"),
      );
      if (status.startsWith("wifi_failed")) setStep("network");
    } catch {
      setError(t("errors.timeout"));
    } finally {
      off();
    }
  };

  const handleFinish = () => {
    sessionRef.current?.disconnect();
    onLinked?.();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const connectingFailed = step === "connecting" && !!error;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t("title")}</h2>
            <StepDots current={step} />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {/* ── PASO 1: encontrar el módulo por Bluetooth ───────────── */}
          {step === "discover" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("discover.title")}</p>
              {!supported ? (
                <div className={styles.hint} role="alert">
                  <p>
                    <AlertTriangle size={14} />{" "}
                    {linuxFlag ? t("discover.linuxFlag") : t("discover.unsupported")}
                  </p>
                  {linuxFlag && (
                    <p>
                      <code>chrome://flags/#enable-experimental-web-platform-features</code>
                    </p>
                  )}
                  <p>{t("discover.portalFallback")}</p>
                </div>
              ) : (
                <>
                  <p className={styles.hint}>{t("discover.hint")}</p>
                  {module ? (
                    <>
                      <p className={styles.blockLabel}>{t("discover.foundTitle")}</p>
                      <div className={styles.deviceOptions}>
                        <div className={`${styles.deviceOption} ${styles.deviceOptionSelected}`}>
                          <span className={styles.deviceOptionIcon}>
                            <CircuitBoard size={16} />
                          </span>
                          <span className={styles.deviceOptionName}>{module.code}</span>
                          <Check size={16} className={styles.deviceOptionCheck} />
                        </div>
                      </div>
                    </>
                  ) : (
                    connectingBle && (
                      <div className={styles.scanningBox}>
                        <span className={styles.pulseWrap}>
                          <span className={styles.pulseRing} />
                          <Bluetooth size={22} className={styles.scanIcon} />
                        </span>
                        <p className={styles.scanningText}>{t("discover.scanning")}</p>
                      </div>
                    )
                  )}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={handleSearch}
                    disabled={connectingBle}
                  >
                    <Search size={13} />
                    {module ? t("discover.rescan") : t("discover.search")}
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── PASO 2: qué electrodoméstico mide ──────────────────── */}
          {step === "appliance" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("appliance.title")}</p>
              <p className={styles.hint}>{t("appliance.hint")}</p>

              <div className={styles.applianceGrid}>
                {applianceTypes.map((appliance) => {
                  const Icon = APPLIANCE_ICON[appliance.uiType];
                  const isSelected = selectedAppliance?.id === appliance.id;
                  return (
                    <button
                      type="button"
                      key={appliance.id}
                      className={`${styles.applianceOption} ${
                        isSelected ? styles.applianceOptionSelected : ""
                      }`}
                      onClick={() => {
                        setSelectedAppliance(appliance);
                        if (!deviceName.trim()) {
                          setDeviceName(tDevices(`applianceTypes.${appliance.uiType}`));
                        }
                      }}
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
                  id="device-name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder={t("done.nameLabel")}
                  maxLength={50}
                >
                  {t("done.nameLabel")}
                </Input>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="device-room">
                  {t("done.roomLabel")}
                </label>
                <select
                  id="device-room"
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

          {/* ── PASO 3: red Wi-Fi que ve el módulo ─────────────────── */}
          {step === "network" && (
            <div className={styles.stepBlock}>
              <p className={styles.stepTitle}>{t("network.title")}</p>
              <p className={styles.hint}>{t("network.subtitle")}</p>

              {scanning ? (
                <div className={styles.scanningBox}>
                  <span className={styles.pulseWrap}>
                    <span className={styles.pulseRing} />
                    <Wifi size={22} className={styles.scanIcon} />
                  </span>
                  <p className={styles.scanningText}>{t("network.scanning")}</p>
                </div>
              ) : (
                <>
                  {!manual && (
                    <div className={styles.networkOptions}>
                      {networks.map((network) => {
                        const isSelected = selectedNetwork?.ssid === network.ssid;
                        return (
                          <button
                            type="button"
                            key={network.ssid}
                            className={`${styles.networkOption} ${
                              isSelected ? styles.deviceOptionSelected : ""
                            }`}
                            onClick={() => {
                              setSelectedNetwork(network);
                              setError("");
                            }}
                          >
                            <SignalBars signal={signalPercent(network.rssi)} />
                            <span className={styles.networkName}>{network.ssid}</span>
                            {network.secured ? (
                              <Lock size={13} className={styles.lockIcon} />
                            ) : (
                              <span className={styles.openTag}>{t("network.open")}</span>
                            )}
                            {isSelected && <Check size={16} className={styles.deviceOptionCheck} />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {manual && (
                    <div className={styles.field}>
                      <Input
                        id="wifi-ssid"
                        value={manualSsid}
                        onChange={(e) => setManualSsid(e.target.value)}
                        placeholder={t("network.ssidPlaceholder")}
                        maxLength={32}
                      >
                        {t("network.ssidLabel")}
                      </Input>
                    </div>
                  )}

                  <button type="button" className={styles.linkBtn} onClick={scan}>
                    <Search size={13} />
                    {t("network.rescan")}
                  </button>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => {
                      setManual((v) => !v);
                      setError("");
                    }}
                  >
                    {manual ? t("network.pickFromList") : t("network.manual")}
                  </button>
                </>
              )}

              {needsPassword && ssid && (
                <div className={styles.field}>
                  <Input
                    id="wifi-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder={t("network.passwordPlaceholder")}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    onIconClick={() => setShowPassword((v) => !v)}
                  >
                    {t("network.passwordLabel")}
                  </Input>
                </div>
              )}
            </div>
          )}

          {/* ── PASO 4: conectando (progreso real del módulo) ──────── */}
          {step === "connecting" && (
            <div className={styles.stepBlock}>
              <div className={styles.connectingBox}>
                {connectingFailed ? (
                  <AlertTriangle size={32} />
                ) : (
                  <Loader2 size={32} className={styles.spinner} />
                )}
                <p className={styles.stepTitle}>{t("connecting.title")}</p>

                <ul className={styles.connectingList}>
                  {[
                    t("connecting.step0"),
                    t("connecting.step1", { ssid }),
                    t("connecting.step2"),
                    t("connecting.step3"),
                  ].map((label, i) => (
                    <li key={label} className={progress >= i ? styles.connectingDone : ""}>
                      {progress > i ? <Check size={13} /> : <span className={styles.dot} />}
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── PASO 5: listo ──────────────────────────────────────── */}
          {step === "done" && (
            <div className={styles.stepBlock}>
              <div className={styles.doneBox}>
                <CheckCircle2 size={40} className={styles.doneIcon} />
                <p className={styles.stepTitle}>{t("done.title")}</p>
                <p className={styles.hint}>{t("done.subtitle", { name: deviceName.trim() })}</p>
              </div>
            </div>
          )}

          {error && (
            <span className={styles.errorMsg} role="alert">
              {error}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          {step === "discover" && (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              <Button variant="primary" onClick={() => setStep("appliance")} disabled={!module}>
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
                onClick={goToNetwork}
                disabled={!selectedAppliance || !deviceName.trim()}
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
              <Button variant="primary" onClick={handleConnect} disabled={!ssid || scanning}>
                {t("buttons.connect")}
              </Button>
            </>
          )}

          {step === "connecting" && (
            <>
              <Button variant="secondary" onClick={onClose}>
                {t("buttons.cancel")}
              </Button>
              {connectingFailed && (
                <Button variant="primary" onClick={() => setStep("network")}>
                  {t("buttons.retry")}
                </Button>
              )}
            </>
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
