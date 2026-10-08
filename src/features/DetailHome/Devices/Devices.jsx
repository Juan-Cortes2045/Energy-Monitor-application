import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plug, Wifi, WifiOff, Trash2, Plus, Loader2, Pencil, RefreshCw } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import LinkDeviceModal from "./LinkDeviceModal/LinkDeviceModal";
import EditDeviceModal from "./EditDeviceModal/EditDeviceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal/ConfirmDeleteModal";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import { errorMessage } from "../../../services/http";
import { APPLIANCE_ICON } from "../shared/deviceTypes";
import styles from "./Devices.module.css";

const SignalIcon = ({ status, signal }) => {
  if (status === "checking") {
    return <Loader2 size={14} className={styles.checkingIcon} aria-hidden="true" />;
  }
  if (status !== "online") {
    return <WifiOff size={14} className={styles.signalOff} aria-hidden="true" />;
  }
  const level = signal >= 70 ? styles.signalHigh : signal >= 35 ? styles.signalMed : styles.signalLow;
  return <Wifi size={14} className={`${styles.signalIcon} ${level}`} aria-hidden="true" />;
};

const DeviceRow = ({ device, isOwner, onRequestRemove, onEdit, onReconnect, t }) => {
  const Icon = APPLIANCE_ICON[device.applianceType] ?? Plug;
  const displayName = device.name || t(`applianceTypes.${device.applianceType}`);
  const displayRoom =
    device.room || (device.roomKey ? t(`rooms.${device.roomKey}`) : "");

  return (
    <div className={styles.deviceRow}>
      <div className={`${styles.deviceIcon} ${device.status === "offline" ? styles.deviceIconOff : styles.deviceIconOn}`}>
        <Icon size={18} />
      </div>

      <div className={styles.deviceInfo}>
        <p className={styles.deviceName}>{displayName}</p>
        <p className={styles.deviceRoom}>{displayRoom}</p>
      </div>

      <div className={styles.deviceMeta}>
        <span
          className={`${styles.statusBadge} ${
            device.status === "online"
              ? styles.statusOnline
              : device.status === "checking"
                ? styles.statusChecking
                : styles.statusOffline
          }`}
          role="status"
          aria-live="polite"
        >
          <SignalIcon status={device.status} signal={device.signal} />
          {t(`status.${device.status}`)}
        </span>
        {device.consumption != null && (
          <span className={styles.consumption}>{device.consumption} kW</span>
        )}
      </div>

      {isOwner && (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onEdit(device)}
            aria-label={t("actions.edit", { name: displayName })}
            title={t("actions.edit", { name: displayName })}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onReconnect(device)}
            aria-label={t("actions.reconnect", { name: displayName })}
            title={t("actions.reconnect", { name: displayName })}
          >
            <RefreshCw size={14} />
          </button>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRequestRemove(device)}
            aria-label={t("actions.remove", { name: displayName })}
            title={t("actions.remove", { name: displayName })}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const Devices = ({
  homeId,
  isOwner = false,
  devices,
  loading = false,
  error = null,
  onRetry,
  onLinked,
  onRemoveDevice,
}) => {
  const { t } = useTranslation("devices");
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [deviceToEdit, setDeviceToEdit] = useState(null);
  const [deviceToReconnect, setDeviceToReconnect] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  const handleRequestRemove = (device) => {
    setDeviceToDelete(device);
  };

  const handleCancelRemove = () => {
    setDeviceToDelete(null);
  };

  const handleConfirmRemove = async (device) => {
    setDeviceToDelete(null);
    setRemoveError(null);
    try {
      await onRemoveDevice(device.id);
    } catch (err) {
      setRemoveError(err);
    }
  };

  const handleLinked = () => {
    setModalOpen(false);
    setDeviceToEdit(null);
    setDeviceToReconnect(null);
    onLinked?.();
  };

  const onlineCount = devices.filter((d) => d.status === "online").length;

  return (
    <div className={styles.page}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{t("header.title")}</h2>
          <p className={styles.sectionSub}>
            {t("header.subtitle", { online: onlineCount, total: devices.length })}
          </p>
        </div>

        {isOwner && (
          <Button variant="primary" size="medium" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            {t("actions.link")}
          </Button>
        )}
      </div>

      {removeError && (
        <p className={styles.sectionSub} role="alert">
          {errorMessage(t, removeError, "deviceUnlink")}
        </p>
      )}

      <Card>
        {error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : loading ? (
          <p className={styles.sectionSub} role="status">{t("loading")}</p>
        ) : devices.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <WifiOff size={22} />
            </div>
            <p className={styles.emptyTitle}>{t("empty.title")}</p>
            <p className={styles.emptySub}>
              {isOwner ? t("empty.subtitle") : t("empty.subtitleReadOnly")}
            </p>
            {isOwner && (
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                <Plus size={16} />
                {t("empty.cta")}
              </Button>
            )}
          </div>
        ) : (
          <div className={styles.deviceList}>
            {devices.map((device) => (
              <DeviceRow
                key={device.id}
                device={device}
                isOwner={isOwner}
                onRequestRemove={handleRequestRemove}
                onEdit={setDeviceToEdit}
                onReconnect={setDeviceToReconnect}
                t={t}
              />
            ))}
          </div>
        )}
      </Card>

      {modalOpen && isOwner && (
        <LinkDeviceModal
          homeId={homeId}
          onClose={() => setModalOpen(false)}
          onLinked={handleLinked}
        />
      )}

      {deviceToEdit && isOwner && (
        <EditDeviceModal
          homeId={homeId}
          device={deviceToEdit}
          onClose={() => setDeviceToEdit(null)}
          onSaved={handleLinked}
        />
      )}

      {deviceToReconnect && isOwner && (
        <LinkDeviceModal
          homeId={homeId}
          device={deviceToReconnect}
          onClose={() => setDeviceToReconnect(null)}
          onLinked={handleLinked}
        />
      )}

      {deviceToDelete && (
        <ConfirmDeleteModal
          device={deviceToDelete}
          onCancel={handleCancelRemove}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
};

export default Devices;
