import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plug, Wifi, WifiOff, Trash2, Plus } from "lucide-react";

import Card from "../../../design/components/Card/Card";
import Button from "../../../design/components/Button/Button";
import LinkDeviceModal from "./LinkDeviceModal/LinkDeviceModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal/ConfirmDeleteModal";
import { APPLIANCE_ICON } from "../shared/deviceTypes";
import { useApplianceTypes } from "../shared/useApplianceTypes";
import { useHomeDevices } from "./useHomeDevices";
import { unlinkDevice } from "../../../services/device.service";
import LoadingState from "../../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import styles from "./Devices.module.css";

const SignalIcon = ({ status, signal }) => {
  if (status !== "ONLINE") {
    return <WifiOff size={14} className={styles.signalOff} aria-hidden="true" />;
  }
  const level = signal >= 70 ? styles.signalHigh : signal >= 35 ? styles.signalMed : styles.signalLow;
  return <Wifi size={14} className={`${styles.signalIcon} ${level}`} aria-hidden="true" />;
};

const DeviceRow = ({ device, applianceKey, isOwner, onRequestRemove, t }) => {
  const Icon = APPLIANCE_ICON[applianceKey] ?? Plug;
  const displayName = device.name || t(`applianceTypes.${applianceKey}`);
  const displayRoom = device.location ? t(`rooms.${device.location}`) : "";

  return (
    <div className={styles.deviceRow}>
      <div className={`${styles.deviceIcon} ${device.status === "ONLINE" ? styles.deviceIconOn : styles.deviceIconOff}`}>
        <Icon size={18} />
      </div>

      <div className={styles.deviceInfo}>
        <p className={styles.deviceName}>{displayName}</p>
        <p className={styles.deviceRoom}>{displayRoom}</p>
      </div>

      <div className={styles.deviceMeta}>
        <span
          className={`${styles.statusBadge} ${
            device.status === "ONLINE" ? styles.statusOnline : styles.statusOffline
          }`}
        >
          <SignalIcon status={device.status} signal={device.signal_strength} />
          {device.status === "ONLINE" ? t("status.online") : t("status.offline")}
        </span>
        {device.status === "ONLINE" && (
          <span className={styles.consumption}>{device.consumption_today_kwh} kWh</span>
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

const Devices = ({ homeId, isOwner = false }) => {
  const { t } = useTranslation("devices");
  const { nameOf } = useApplianceTypes();
  const { data: devices, loading, error, refetch } = useHomeDevices(homeId);
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleRequestRemove = (device) => {
    setDeviceToDelete(device);
  };

  const handleCancelRemove = () => {
    setDeviceToDelete(null);
  };

  const handleConfirmRemove = async (device) => {
    setRemoving(true);
    try {
      await unlinkDevice(homeId, device.id);
      await refetch();
    } finally {
      setRemoving(false);
      setDeviceToDelete(null);
    }
  };

  const handleLinked = () => {
    setModalOpen(false);
    refetch();
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const onlineCount = devices.filter((d) => d.status === "ONLINE").length;

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
                applianceKey={nameOf(device.appliance_type_id)}
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
          homeId={homeId}
          onClose={() => setModalOpen(false)}
          onLinked={handleLinked}
        />
      )}

      {deviceToDelete && (
        <ConfirmDeleteModal
          device={{ ...deviceToDelete, applianceType: nameOf(deviceToDelete.appliance_type_id) }}
          onCancel={handleCancelRemove}
          onConfirm={handleConfirmRemove}
          disabled={removing}
        />
      )}
    </div>
  );
};

export default Devices;
