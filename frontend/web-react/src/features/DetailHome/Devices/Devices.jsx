import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plug, Wifi, WifiOff, Trash2, Plus } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import LinkDeviceModal from "./LinkDeviceModal/LinkDeviceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal/ConfirmDeleteModal";
import { APPLIANCE_ICON } from "../shared/deviceTypes";
import styles from "./Devices.module.css";

const SignalIcon = ({ status, signal }) => {
  if (status !== "online") {
    return <WifiOff size={14} className={styles.signalOff} aria-hidden="true" />;
  }
  const level = signal >= 70 ? styles.signalHigh : signal >= 35 ? styles.signalMed : styles.signalLow;
  return <Wifi size={14} className={`${styles.signalIcon} ${level}`} aria-hidden="true" />;
};

const DeviceRow = ({ device, isOwner, onRequestRemove, t }) => {
  const Icon = APPLIANCE_ICON[device.applianceType] ?? Plug;
  const displayName = device.name || t(`applianceTypes.${device.applianceType}`);
  const displayRoom =
    device.room || (device.roomKey ? t(`rooms.${device.roomKey}`) : "");

  return (
    <div className={styles.deviceRow}>
      <div className={`${styles.deviceIcon} ${device.status === "online" ? styles.deviceIconOn : styles.deviceIconOff}`}>
        <Icon size={18} />
      </div>

      <div className={styles.deviceInfo}>
        <p className={styles.deviceName}>{displayName}</p>
        <p className={styles.deviceRoom}>{displayRoom}</p>
      </div>

      <div className={styles.deviceMeta}>
        <span
          className={`${styles.statusBadge} ${
            device.status === "online" ? styles.statusOnline : styles.statusOffline
          }`}
        >
          <SignalIcon status={device.status} signal={device.signal} />
          {device.status === "online" ? t("status.online") : t("status.offline")}
        </span>
        {device.consumption != null && (
          <span className={styles.consumption}>{device.consumption} kW</span>
        )}
      </div>

      {isOwner && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={() => onRequestRemove(device)}
          aria-label={t("actions.remove", { name: displayName })}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

const Devices = ({ isOwner = false, devices, onAddDevice, onRemoveDevice }) => {
  const { t } = useTranslation("devices");
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const handleRequestRemove = (device) => {
    setDeviceToDelete(device);
  };

  const handleCancelRemove = () => {
    setDeviceToDelete(null);
  };

  const handleConfirmRemove = (device) => {
    onRemoveDevice(device.id);
    setDeviceToDelete(null);
  };

  const handleAddDevice = (newDevice) => {
    onAddDevice(newDevice);
    setModalOpen(false);
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

      <Card>
        {devices.length === 0 ? (
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
                t={t}
              />
            ))}
          </div>
        )}
      </Card>

      {modalOpen && isOwner && (
        <LinkDeviceModal
          onClose={() => setModalOpen(false)}
          onAddDevice={handleAddDevice}
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
