import { useCallback, useEffect, useState } from "react";

import { Bell, Mail, Smartphone, CheckCheck } from "lucide-react";

import Card from "../../../../../src/design/components/Card/Card";
import {
  isPushSupported,
  isThisBrowserSubscribed,
  notificationApi,
  pushPermission,
  subscribeThisBrowser,
  unsubscribeThisBrowser,
} from "../../../../services/notifications";
import { errorMessage } from "../../../../services/http";

import styles from "./NotificationSettings.module.css";
import { useTranslation } from "react-i18next";

/**
 * Canales por los que el usuario recibe las alertas de sus hogares. Se guardan en el backend
 * (/notifications/preferences): el correo lo envía el servidor y el push llega a cada navegador
 * suscrito, aunque la pestaña esté cerrada.
 */
const NotificationSettings = () => {
  const { t } = useTranslation("settings");
  const [prefs, setPrefs] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [loaded, browser] = await Promise.all([
        notificationApi.getPreferences(),
        isThisBrowserSubscribed().catch(() => false),
      ]);
      setPrefs(loaded);
      setSubscribed(browser);
    } catch (err) {
      setMessage(errorMessage(t, err));
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos estándar
    load();
  }, [load]);

  /** @param {boolean} managePush el cambio afecta al push de este navegador (suscribir / dar de baja) */
  const save = async (emailEnabled, pushEnabled, managePush) => {
    setBusy(true);
    setMessage("");
    try {
      if (managePush && pushEnabled && !subscribed) {
        const outcome = await subscribeThisBrowser();
        if (outcome !== "subscribed") {
          setMessage(t(`notifications.push.${outcome}`));
          pushEnabled = false;
        } else {
          setSubscribed(true);
        }
      }
      if (managePush && !pushEnabled && subscribed) {
        await unsubscribeThisBrowser();
        setSubscribed(false);
      }
      setPrefs(await notificationApi.updatePreferences({ emailEnabled, pushEnabled }));
    } catch (err) {
      setMessage(errorMessage(t, err));
    } finally {
      setBusy(false);
    }
  };

  const email = !!prefs?.emailEnabled;
  // Push "activo" para este navegador = preferencia encendida y este navegador suscrito.
  const push = !!prefs?.pushEnabled && subscribed;
  const toggle = (key) => {
    if (!prefs || busy) return;
    if (key === "combined") {
      const value = !(email && push);
      save(value, value, true);
    } else if (key === "email") {
      // El push de otros navegadores no cambia por tocar el correo.
      save(!email, !!prefs.pushEnabled, false);
    } else {
      save(email, !push, true);
    }
  };

  const pushHint = !isPushSupported()
    ? t("notifications.push.unsupported")
    : prefs && !prefs.pushAvailable
      ? t("notifications.push.unavailable")
      : pushPermission() === "denied"
        ? t("notifications.push.denied")
        : t("notifications.push.description");

  const activeCount = [email, push].filter(Boolean).length;

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
            enabled={email}
            disabled={!prefs || busy}
            onToggle={() => toggle("email")}
            t={t}
          />

          <NotificationRow
            icon={<Smartphone size={20} />}
            title={t("notifications.push.title")}
            description={pushHint}
            enabled={push}
            disabled={!prefs || busy || !isPushSupported() || !prefs?.pushAvailable}
            onToggle={() => toggle("push")}
            t={t}
          />

          <NotificationRow
            icon={<CheckCheck size={20} />}
            title={t("notifications.combined.title")}
            description={t("notifications.combined.description")}
            enabled={email && push}
            disabled={!prefs || busy || !isPushSupported() || !prefs?.pushAvailable}
            onToggle={() => toggle("combined")}
            t={t}
          />
        </div>

        {message && (
          <p className={styles.message} role="alert">
            {message}
          </p>
        )}
      </div>
    </Card>
  );
};

const NotificationRow = ({ icon, title, description, enabled, disabled = false, onToggle, t }) => {
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
          {enabled ? t("notifications.status.active") : t("notifications.status.inactive")}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={title}
          disabled={disabled}
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
