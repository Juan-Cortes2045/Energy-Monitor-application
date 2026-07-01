import { useState } from "react";

import { Bell, Mail, Smartphone, CheckCheck } from "lucide-react";

import Card from "../../../../../src/design/components/Card/Card";

import styles from "./NotificationSettings.module.css";
import { useTranslation } from "react-i18next";

const NotificationSettings = () => {
  const { t } = useTranslation("settings");
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    combined: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => {
      if (key === "combined") {
        const newValue = !prev.combined;

        return {
          email: newValue,
          push: newValue,
          combined: newValue,
        };
      }

      const updated = {
        ...prev,
        [key]: !prev[key],
      };

      return {
        ...updated,
        combined: updated.email && updated.push,
      };
    });
  };

  const activeCount = [settings.email, settings.push].filter(Boolean).length;

  return (
    <Card maxWidth="100%">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.icon}>
              <Bell size={24} />
            </div>

            <div>
              <h3>{t("notifications.title")}</h3>

              <p>{t("notifications.description")}</p>
            </div>
          </div>

          <span className={styles.counter}>
            {activeCount} {t("notifications.active")}
          </span>
        </div>

        <div className={styles.options}>
          <NotificationRow
            icon={<Mail size={20} />}
            title={t("notifications.email.title")}
            description={t("notifications.email.description")}
            enabled={settings.email}
            onToggle={() => toggleSetting("email")}
            t={t}
          />

          <NotificationRow
            icon={<Smartphone size={20} />}
            title={t("notifications.push.title")}
            description={t("notifications.push.title")}
            enabled={settings.push}
            onToggle={() => toggleSetting("push")}
            t={t}
          />

          <NotificationRow
            icon={<CheckCheck size={20} />}
            title={t("notifications.combined.title")}
            description={t("notifications.combined.description")}
            enabled={settings.combined}
            onToggle={() => toggleSetting("combined")}
            t={t}
          />
        </div>
      </div>
    </Card>
  );
};

const NotificationRow = ({
  icon,
  title,
  description,
  enabled,
  onToggle,
  t,
}) => {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={styles.rowIcon}>{icon}</div>

        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>

      <div className={styles.rowRight}>
        <span
          className={`${styles.status}
          ${enabled ? styles.active : styles.inactive}`}
        >
          {enabled
            ? t("notifications.status.active")
            : t("notifications.status.inactive")}
        </span>

        <button
          className={`${styles.switch}
          ${enabled ? styles.switchOn : ""}`}
          onClick={onToggle}
        >
          <span className={styles.thumb} />
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
