import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, Check, CheckCheck, ShieldCheck, Trash2, UserPlus, UserX } from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import ErrorState from "../../components/shared/ErrorState/ErrorState";
import { useNotificationCenter } from "../../context/useNotificationCenter";
import styles from "../Notifications/Notifications.module.css";

/** Icono según el evento: cuenta nueva, cambio de estado o cambio de rol. */
const iconFor = (key) =>
  key.startsWith("admin.accountRegistered")
    ? UserPlus
    : key.startsWith("admin.statusChanged")
      ? UserX
      : ShieldCheck;

/**
 * Notificaciones de administrador (GET /admin/notifications): cuentas nuevas y los cambios de
 * estado o de rol que hicieron los demás administradores. Solo se ven aquí, no llegan por
 * correo ni push. Se marcan como leídas y se eliminan una a una.
 */
const AdminNotifications = () => {
  const { t, i18n } = useTranslation("admin");
  const { adminNotifications, error, reload, markAdminRead, markAllAdminRead, removeAdmin } =
    useNotificationCenter();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);

  const unread = adminNotifications.filter((n) => !n.read).length;
  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString(i18n.language, { dateStyle: "medium", timeStyle: "short" }) : "";

  const run = async (action) => {
    setBusy(true);
    setActionError(false);
    try {
      await action();
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <Header
          breadcrumbItems={[
            { label: t("breadcrumb.current"), path: "/admin/users" },
            { label: t("notifications.breadcrumb") },
          ]}
        />

        <div className={styles.hero}>
          <h1 className={styles.title}>{t("notifications.title")}</h1>
          <p className={styles.subtitle}>{t("notifications.subtitle")}</p>
        </div>

        <div className={styles.gridBox}>
          {unread > 0 && (
            <div className={styles.tabsRow}>
              <span />
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={() => run(markAllAdminRead)}
                disabled={busy}
              >
                <CheckCheck size={14} />
                {t("notifications.markAllRead")}
              </button>
            </div>
          )}

          {actionError && (
            <p className={styles.subtitle} role="alert">
              {t("notifications.failed")}
            </p>
          )}

          <Card>
            {error ? (
              <ErrorState error={error} onRetry={reload} />
            ) : adminNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={40} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>{t("notifications.empty.title")}</p>
                <p className={styles.emptyDesc}>{t("notifications.empty.description")}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {adminNotifications.map((n) => {
                  const Icon = iconFor(n.messageKey);
                  const who = n.subjectName || n.subjectEmail || t("notifications.unknownAccount");
                  return (
                    <div key={n.id} className={`${styles.row} ${n.read ? styles.rowMuted : ""}`}>
                      <div className={`${styles.icon} ${styles.iconInfo}`}>
                        <Icon size={18} />
                      </div>
                      <div className={styles.rowBody}>
                        <div className={styles.rowTop}>
                          <p className={styles.rowTitle}>
                            {t(`notifications.events.${n.messageKey}.title`, {
                              defaultValue: t("notifications.events.generic.title"),
                            })}
                          </p>
                          <span className={`${styles.badge} ${n.read ? styles.badgeNeutral : styles.badgeInfo}`}>
                            {n.read ? t("notifications.read") : t("notifications.new")}
                          </span>
                        </div>
                        <p className={styles.rowMessage}>
                          {t(`notifications.events.${n.messageKey}.message`, {
                            who,
                            email: n.subjectEmail ?? "",
                            defaultValue: t("notifications.events.generic.message", { who }),
                          })}
                        </p>
                        <div className={styles.rowMeta}>
                          <span>{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                      <div className={styles.rowActions}>
                        {n.read ? (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => run(() => removeAdmin(n.id))}
                            disabled={busy}
                          >
                            <Trash2 size={14} />
                            {t("notifications.delete")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => run(() => markAdminRead(n.id))}
                            disabled={busy}
                          >
                            <Check size={14} />
                            {t("notifications.markRead")}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
