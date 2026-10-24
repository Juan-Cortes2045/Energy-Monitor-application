import { useEffect, useId, useRef, useState } from "react";
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
import { useDialogA11y } from "../../../../hooks/useDialogA11y";
import styles from "./LinkDeviceModal.module.css";

const LINK_STEPS = ["discover", "appliance", "network", "connecting", "done"];
// Reconectar un módulo ya vinculado (mudanza, nueva contraseña, otro operador): sin electrodoméstico.
const RECONNECT_STEPS = ["discover", "network", "connecting", "done"];

// Progreso de la conexión: cada estado del módulo cierra los pasos anteriores.
const PROGRESS = {
  registering: 0,
  sending: 1,
  wifi_connecting: 1,
  wifi_ok: 2,
  mqtt_connecting: 2,
  mqtt_ok: 3,
};

// Los puntos son visuales; el lector de pantalla oye "Paso X de Y".
const StepDots = ({ steps, current, label }) => (
  <div className={styles.stepDots} role="img" aria-label={label}>
    {steps.map((step, i) => (
      <span
        key={step}
        className={`${styles.stepDot} ${steps.indexOf(current) >= i ? styles.stepDotActive : ""}`}
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

/**
 * Asistente por Bluetooth. Sin `device` vincula un módulo nuevo; con `device` (uno ya vinculado)
 * solo le envía otra red Wi-Fi y credenciales nuevas, sin volver a vincularlo.
 */
const LinkDeviceModal = ({ homeId, device = null, onClose, onLinked }) => {
  const { t } = useTranslation("linkDeviceModal");
  const reconnect = !!device;
  const steps = reconnect ? RECONNECT_STEPS : LINK_STEPS;
  const { t: tDevices } = useTranslation("devices");
  const { t: tc } = useTranslation("common");
  const titleId = useId();
  const errorId = useId();
  const dialogRef = useDialogA11y(onClose);
  const supported = isBluetoothSupported();
  const linuxFlag = needsLinuxBluetoothFlag();

  const [step, setStep] = useState("discover");
  const [error, setError] = useState("");

  // Paso 1: módulo
  const sessionRef = useRef(null);
  const [module, setModule] = useState(null); // { code, name }
  const [connectingBle, setConnectingBle] = useState(false);

  // Paso 2: electrodoméstico
  const [loadingTypes, setLoadingTypes] = useState(true);
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
      .catch((err) => !cancelled && setError(errorMessage(t, err)))
      .finally(() => !cancelled && setLoadingTypes(false));
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
      if (reconnect && session.identity.code !== device.code) {
        // Otro módulo cercano: no se le escribe la red ni la key de este.
        session.disconnect();
        setModule(null);
        setError(t("reconnect.wrongModule", { code: device.code, found: session.identity.code }));
        return;
      }
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
      const found = await sessionRef.current.scanNetworks();
      // Una red con varios puntos de acceso (malla, repetidor) llega repetida: se deja una sola,
      // la de mejor señal, para no repetir la key de React ni confundir al usuario. Las ocultas
      // (sin nombre) se escriben a mano.
      const best = new Map();
      found
        .filter((n) => n.ssid)
        .forEach((n) => {
          if (!best.has(n.ssid) || (n.rssi ?? -Infinity) > (best.get(n.ssid).rssi ?? -Infinity)) {
            best.set(n.ssid, n);
          }
        });
      const list = [...best.values()];
      setNetworks(list);
      if (list.length === 0) setManual(true);
    } catch {
      setError(t("errors.bluetooth"));
    } finally {
      setScanning(false);
    }
  };

  const goToNetwork = () => {
    if (!reconnect && (!selectedAppliance || !deviceName.trim())) return;
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
      linked = reconnect
        ? await deviceApi.reissueCredentials(homeId, device.id)
        : await deviceApi.linkDevice(homeId, {
            deviceCode: module.code,
            name: deviceName.trim(),
            applianceTypeId: selectedAppliance.id,
            location: room,
          });
    } catch (err) {
      setError(errorMessage(t, err, reconnect ? "deviceReconnect" : "deviceLink"));
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
        // La contraseña del Wi-Fi ya está en el módulo: no se guarda en memoria más tiempo.
        setPassword("");
        setShowPassword(false);
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
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title} id={titleId}>
              {reconnect ? t("reconnect.title", { name: device.name }) : t("title")}
            </h2>
            <StepDots
              steps={steps}
              current={step}
              label={t("stepProgress", { current: steps.indexOf(step) + 1, total: steps.length })}
            />
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t("close")}>
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
                    <AlertTriangle size={14} aria-hidden="true" />{" "}
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
                  <p className={styles.hint}>
                    {reconnect ? t("reconnect.hint", { code: device.code }) : t("discover.hint")}
                  </p>
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
                      <div className={styles.scanningBox} role="status">
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

              {loadingTypes && (
                <p className={styles.hint} role="status">
                  {tc("loading")}
                </p>
              )}
              <div className={styles.applianceGrid}>
                {applianceTypes.map((appliance) => {
                  const Icon = APPLIANCE_ICON[appliance.uiType];
                  const isSelected = selectedAppliance?.id === appliance.id;
                  return (
                    <button
                      type="button"
                      key={appliance.id}
                      aria-pressed={isSelected}
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
                <div className={styles.scanningBox} role="status">
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
                            aria-pressed={isSelected}
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
                              <Lock
                                size={13}
                                className={styles.lockIcon}
                                aria-label={t("network.secured")}
                                role="img"
                              />
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
                    iconLabel={tc(showPassword ? "hidePassword" : "showPassword")}
                    // Es la clave del Wi-Fi, no la de esta cuenta: que el navegador no la guarde ni la autocomplete.
                    autoComplete="off"
                    maxLength={63}
                    aria-describedby={error ? errorId : undefined}
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

                <ul className={styles.connectingList} aria-live="polite">
                  {[
                    reconnect ? t("reconnect.step0") : t("connecting.step0"),
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
                <p className={styles.stepTitle}>
                  {reconnect ? t("reconnect.doneTitle") : t("done.title")}
                </p>
                <p className={styles.hint}>
                  {t("done.subtitle", { name: reconnect ? device.name : deviceName.trim() })}
                </p>
              </div>
            </div>
          )}

          {error && (
            <span className={styles.errorMsg} role="alert" id={errorId}>
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
              <Button
                variant="primary"
                onClick={() => (reconnect ? goToNetwork() : setStep("appliance"))}
                disabled={!module}
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
                onClick={goToNetwork}
                disabled={!selectedAppliance || !deviceName.trim()}
              >
                {t("buttons.continue")}
              </Button>
            </>
          )}

          {step === "network" && (
            <>
              <Button variant="secondary" onClick={() => setStep(reconnect ? "discover" : "appliance")}>
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
