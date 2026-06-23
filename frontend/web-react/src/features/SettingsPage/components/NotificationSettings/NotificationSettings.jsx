import { useState } from "react";

import {
  Bell,
  Mail,
  Smartphone,
  CheckCheck,
} from "lucide-react";

import Card from "../../../../../src/design/components/Card/Card";

import styles from "./NotificationSettings.module.css";

const NotificationSettings = () => {
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
      combined:
        updated.email && updated.push,
        };
        });
    };

  const activeCount = [
    settings.email,
    settings.push,
    ].filter(Boolean).length;

  return (
    <Card maxWidth="100%">
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.info}>
            <div className={styles.icon}>
              <Bell size={24} />
            </div>

            <div>
              <h3>Notificaciones</h3>

              <p>
                Configura cómo deseas recibir
                alertas y eventos del sistema
              </p>
            </div>
          </div>

          <span className={styles.counter}>
            {activeCount} activas
          </span>
        </div>

        <div className={styles.options}>
          <NotificationRow
            icon={<Mail size={20} />}
            title="Correo electrónico"
            description="Alertas enviadas al correo registrado"
            enabled={settings.email}
            onToggle={() =>
              toggleSetting("email")
            }
          />

          <NotificationRow
            icon={<Smartphone size={20} />}
            title="Notificaciones push"
            description="Alertas dentro de la plataforma"
            enabled={settings.push}
            onToggle={() =>
              toggleSetting("push")
            }
          />

          <NotificationRow
            icon={<CheckCheck size={20} />}
            title="Modo combinado"
            description="Activa ambos canales simultáneamente"
            enabled={settings.combined}
            onToggle={() =>
              toggleSetting("combined")
            }
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
}) => {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={styles.rowIcon}>
          {icon}
        </div>

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
          {enabled ? "Activo" : "Inactivo"}
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