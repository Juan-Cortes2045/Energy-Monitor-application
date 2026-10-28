import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Zap,
  AlertTriangle,
  WifiOff,
  CircuitBoard,
  Gauge,
  Lightbulb,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import ErrorState from "../../components/shared/ErrorState/ErrorState";
import ConfirmModal from "../../components/shared/ConfirmModal/ConfirmModal";
import { useHomes } from "../../context/useHomes";
import { useNotificationCenter } from "../../context/useNotificationCenter";
import { ACCOUNT_SCOPE, ALL_SCOPE, inScope } from "../../context/notificationScope";
import AdminNotifications from "../Admin/AdminNotifications";
import { usePermissions } from "../../services/auth/usePermissions";
import { ACTIVITY_ICONS, FALLBACK_ACTIVITY_ICON } from "./activityIcons";
import { activityText } from "./activityText";
import styles from "./Notifications.module.css";

const TABS = ["all", "alerts", "recommendations", "activity"];

/** El hogar elegido en el filtro se recuerda en este navegador. */
const SCOPE_KEY = "energymonitor.notificationsScope";

function readScope() {
  try {
    return localStorage.getItem(SCOPE_KEY) ?? ALL_SCOPE;
  } catch {
    return ALL_SCOPE;
  }
}

function writeScope(scope) {
  try {
    localStorage.setItem(SCOPE_KEY, scope);
  } catch {
    // almacenamiento no disponible: el filtro vuelve a "todos" al recargar, no es grave
  }
}

const byDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

const ALERT_ICONS = {
  connectivity: WifiOff,
  device: CircuitBoard,
  limit: Gauge,
  critical: Zap,
  warning: AlertTriangle,
};

/** Botón pequeño de las filas. */
const RowButton = ({ icon, label, onClick, disabled }) => (
  <button type="button" className={styles.actionBtn} onClick={onClick} disabled={disabled}>
    {icon}
    {label}
  </button>
);

/**
 * Una alerta. Las de umbral y desconexión no se resuelven a mano: el sistema las cierra cuando
 * el consumo se normaliza o el dispositivo vuelve a reportar. Las informativas (dispositivo
 * vinculado) se marcan como leídas. Resuelta o leída, se puede eliminar.
 */
const AlertRow = ({ alert, t, formatDate, onMarkRead, onDelete, busy = false }) => {
  const Icon = ALERT_ICONS[alert.type === "threshold" ? alert.severity : alert.type];
  const statusLabel = alert.autoResolved
    ? alert.resolved
      ? t("status.resolvedAuto")
      : t("status.active")
    : alert.resolved
      ? t("status.read")
      : t("status.new");

  return (
    <div className={`${styles.row} ${alert.resolved ? styles.rowMuted : ""}`}>
      <div
        className={`${styles.icon} ${
          alert.severity === "critical"
            ? styles.iconDanger
            : alert.severity === "info"
              ? styles.iconInfo
              : styles.iconWarning
        }`}
      >
        <Icon size={18} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <p className={styles.rowTitle}>{t(`${alert.key}.title`)}</p>
          <span
            className={`${styles.badge} ${
              alert.resolved
                ? styles.badgeNeutral
                : alert.severity === "critical"
                  ? styles.badgeDanger
                  : alert.severity === "info"
                    ? styles.badgeInfo
                    : styles.badgeWarning
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <p className={styles.rowMessage}>{t(`${alert.key}.message`, { home: alert.home })}</p>

        <div className={styles.rowMeta}>
          <span>{alert.home}</span>
          <span className={styles.metaDot} />
          <span>{formatDate(alert.date)}</span>
          {alert.autoResolved && !alert.resolved && (
            <>
              <span className={styles.metaDot} />
              <span>
                <RefreshCw size={11} /> {t(`autoResolveHint.${alert.type}`)}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.rowActions}>
        {!alert.autoResolved && !alert.resolved && (
          <RowButton
            icon={<Check size={13} />}
            label={t("actions.markRead")}
            onClick={() => onMarkRead(alert.id)}
            disabled={busy}
          />
        )}
        {alert.resolved && (
          <RowButton
            icon={<Trash2 size={13} />}
            label={t("actions.delete")}
            onClick={() => onDelete(alert.id)}
            disabled={busy}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Una recomendación generada a partir del consumo del hogar (ERF4.4): se marca como leída y,
 * leída, se puede eliminar.
 */
const RecommendationRow = ({ recommendation, t, formatDate, onMarkRead, onDelete, busy = false }) => (
  <div className={`${styles.row} ${recommendation.read ? styles.rowMuted : ""}`}>
    <div className={`${styles.icon} ${styles.iconInfo}`}>
      <Lightbulb size={18} />
    </div>

    <div className={styles.rowBody}>
      <div className={styles.rowTop}>
        <p className={styles.rowTitle}>
          {t(`${recommendation.key}.title`, { defaultValue: t("recommendation.generic.title") })}
        </p>
        <span className={`${styles.badge} ${recommendation.read ? styles.badgeNeutral : styles.badgeInfo}`}>
          {recommendation.read ? t("status.read") : t("status.new")}
        </span>
      </div>

      <p className={styles.rowMessage}>
        {t(`${recommendation.key}.message`, {
          home: recommendation.home,
          device: recommendation.device ?? t("recommendation.someDevice"),
          defaultValue: t("recommendation.generic.message", { home: recommendation.home }),
        })}
      </p>

      <div className={styles.rowMeta}>
        <span>{recommendation.home}</span>
        {recommendation.device && (
          <>
            <span className={styles.metaDot} />
            <span>{recommendation.device}</span>
          </>
        )}
        <span className={styles.metaDot} />
        <span>{formatDate(recommendation.date)}</span>
      </div>
    </div>

    <div className={styles.rowActions}>
      {recommendation.read ? (
        <RowButton
          icon={<Trash2 size={13} />}
          label={t("actions.delete")}
          onClick={() => onDelete(recommendation.id)}
          disabled={busy}
        />
      ) : (
        <RowButton
          icon={<Check size={13} />}
          label={t("actions.markRead")}
          onClick={() => onMarkRead(recommendation.id)}
          disabled={busy}
        />
      )}
    </div>
  </div>
);

/**
 * Lo que pasó en la cuenta, los hogares y los dispositivos del usuario: bienvenida, hogar creado,
 * miembros que entran o salen, umbrales, propietario, hogar eliminado, dispositivos. Se marca como
 * leída y, leída, se puede eliminar. El texto se arma con los nombres que guardó la notificación.
 */
const ActivityRow = ({ item, t, formatDate, onMarkRead, onDelete, busy = false }) => {
  const Icon = ACTIVITY_ICONS[item.key] ?? FALLBACK_ACTIVITY_ICON;
  const { title, message } = activityText(item, t);
  return (
    <div className={`${styles.row} ${item.read ? styles.rowMuted : ""}`}>
      <div className={`${styles.icon} ${styles.iconInfo}`}>
        <Icon size={18} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <p className={styles.rowTitle}>{title}</p>
          <span className={`${styles.badge} ${item.read ? styles.badgeNeutral : styles.badgeInfo}`}>
            {item.read ? t("status.read") : t("status.new")}
          </span>
        </div>

        <p className={styles.rowMessage}>{message}</p>

        <div className={styles.rowMeta}>
          <span>{item.home ?? t("filter.account")}</span>
          <span className={styles.metaDot} />
          <span>{formatDate(item.date)}</span>
        </div>
      </div>

      <div className={styles.rowActions}>
        {item.read ? (
          <RowButton
            icon={<Trash2 size={13} />}
            label={t("actions.delete")}
            onClick={() => onDelete(item.id)}
            disabled={busy}
          />
        ) : (
          <RowButton
            icon={<Check size={13} />}
            label={t("actions.markRead")}
            onClick={() => onMarkRead(item.id)}
            disabled={busy}
          />
        )}
      </div>
    </div>
  );
};

const HomeNotifications = () => {
  const { t, i18n } = useTranslation("notifications");
  const { homes, error: homesError, reload: reloadHomes } = useHomes();
  const {
    alerts,
    error: alertsError,
    reload: reloadAlerts,
    markRead,
    remove,
    removeAllResolved,
    recommendations,
    markRecommendationRead,
    markAllRecommendationsRead,
    removeRecommendation,
    removeAllReadRecommendations,
    activity,
    markActivityRead,
    markAllActivityRead,
    removeActivity,
    removeAllReadActivity,
  } = useNotificationCenter();
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [storedScope, setStoredScope] = useState(readScope);

  // Un hogar que ya no es del usuario (salió o se eliminó) vuelve el filtro a "todos".
  const scope =
    storedScope === ALL_SCOPE || storedScope === ACCOUNT_SCOPE || homes.some((h) => h.idHome === storedScope)
      ? storedScope
      : ALL_SCOPE;
  const chooseScope = (next) => {
    setStoredScope(next);
    writeScope(next);
  };

  const scopedAlerts = useMemo(() => alerts.filter((a) => inScope(a, scope)), [alerts, scope]);
  const scopedRecommendations = useMemo(
    () => recommendations.filter((r) => inScope(r, scope)),
    [recommendations, scope],
  );
  const scopedActivity = useMemo(() => (activity ?? []).filter((n) => inScope(n, scope)), [activity, scope]);

  /** Sin leer de cada opción del filtro, para mostrarlo junto a su nombre. */
  const unreadIn = (option) =>
    alerts.filter((a) => !a.resolved && inScope(a, option)).length +
    recommendations.filter((r) => !r.read && inScope(r, option)).length +
    (activity ?? []).filter((n) => !n.read && inScope(n, option)).length;

  const loadError = homesError ?? alertsError;
  const retry = () => (homesError ? reloadHomes() : reloadAlerts());

  const withBusy = async (id, action) => {
    setBusyIds((prev) => new Set(prev).add(id));
    setActionError(null);
    try {
      await action(id);
    } catch (err) {
      setActionError(err);
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const breadcrumbItems = [
    { label: t("breadcrumb.home"), path: "/dashboard" },
    { label: t("breadcrumb.current") },
  ];

  const formatDate = (isoDate) => {
    try {
      return new Intl.DateTimeFormat(i18n.language, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(isoDate));
    } catch {
      return isoDate;
    }
  };

  const shows = (tab) => activeTab === "all" || activeTab === tab;

  const activeAlertsCount = scopedAlerts.filter((a) => !a.resolved).length;
  const unreadRecommendationsCount = scopedRecommendations.filter((r) => !r.read).length;
  const unreadActivityCount = scopedActivity.filter((n) => !n.read).length;
  const tabCounts = {
    alerts: activeAlertsCount,
    recommendations: unreadRecommendationsCount,
    activity: unreadActivityCount,
  };

  // "Marcar todo como leído" y "Eliminar" actúan sobre lo que se ve: la pestaña y el hogar elegidos.
  const markableRecommendations = shows("recommendations") ? unreadRecommendationsCount : 0;
  const markableActivity = shows("activity") ? unreadActivityCount : 0;

  const handleMarkAllRead = async () => {
    setClearing(true);
    setActionError(null);
    try {
      await Promise.all([
        markableRecommendations ? markAllRecommendationsRead(scope) : null,
        markableActivity ? markAllActivityRead(scope) : null,
      ]);
    } catch (err) {
      setActionError(err);
    } finally {
      setClearing(false);
    }
  };

  const clearableAlerts = shows("alerts") ? scopedAlerts.filter((a) => a.resolved).length : 0;
  const clearableRecommendations = shows("recommendations") ? scopedRecommendations.filter((r) => r.read).length : 0;
  const clearableActivity = shows("activity") ? scopedActivity.filter((n) => n.read).length : 0;
  const clearable = clearableAlerts + clearableRecommendations + clearableActivity;

  // Borrado en bloque e irreversible: se confirma antes en un modal.
  const handleClear = async () => {
    setConfirmClear(false);
    setClearing(true);
    setActionError(null);
    try {
      await Promise.all([
        clearableRecommendations ? removeAllReadRecommendations(scope) : null,
        clearableAlerts ? removeAllResolved(scope) : null,
        clearableActivity ? removeAllReadActivity(scope) : null,
      ]);
    } catch (err) {
      setActionError(err);
    } finally {
      setClearing(false);
    }
  };

  const listToRender = useMemo(() => {
    const lists = {
      alerts: scopedAlerts,
      recommendations: scopedRecommendations,
      activity: scopedActivity,
    };
    const shown = activeTab === "all" ? Object.values(lists).flat() : lists[activeTab];
    return [...shown].sort(byDateDesc);
  }, [activeTab, scopedAlerts, scopedRecommendations, scopedActivity]);

  const emptyKey = `empty.${activeTab}`;

  const scopeOptions = [
    { value: ALL_SCOPE, label: t("filter.all") },
    ...homes.map((h) => ({ value: h.idHome, label: h.name })),
    { value: ACCOUNT_SCOPE, label: t("filter.account") },
  ];

  return (
    <div className={styles.content}>
      <div className={styles.wrapper}>
        <Header breadcrumbItems={breadcrumbItems} />

        <div className={styles.hero}>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
        </div>

        <div className={styles.gridBox}>
          <div className={styles.tabsRow}>
            <div className={styles.tabs}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                >
                  {t(`tabs.${tab}`)}
                  {tabCounts[tab] > 0 && <span className={styles.tabCount}>{tabCounts[tab]}</span>}
                </button>
              ))}
            </div>

            <div className={styles.tabs}>
              <label className={styles.scopeFilter}>
                <span className={styles.scopeLabel}>{t("filter.label")}</span>
                <select
                  className={styles.scopeSelect}
                  value={scope}
                  onChange={(e) => chooseScope(e.target.value)}
                >
                  {scopeOptions.map((option) => {
                    const unread = unreadIn(option.value);
                    return (
                      <option key={option.value} value={option.value}>
                        {unread > 0 ? `${option.label} (${unread})` : option.label}
                      </option>
                    );
                  })}
                </select>
              </label>
              {markableRecommendations + markableActivity > 0 && (
                <button type="button" className={styles.markAllBtn} onClick={handleMarkAllRead} disabled={clearing}>
                  <CheckCheck size={14} />
                  {t("actions.markAllRead")}
                </button>
              )}
              {clearable > 0 && (
                <button
                  type="button"
                  className={styles.markAllBtn}
                  onClick={() => setConfirmClear(true)}
                  disabled={clearing}
                >
                  <Trash2 size={14} />
                  {t("actions.deleteAllResolved", { count: clearable })}
                </button>
              )}
            </div>
          </div>

          {actionError && (
            <p className={styles.subtitle} role="alert">
              {t("actions.failed")}
            </p>
          )}

          <Card>
            {loadError ? (
              <ErrorState error={loadError} onRetry={retry} />
            ) : listToRender.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={40} className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>{t(`${emptyKey}.title`)}</p>
                <p className={styles.emptyDesc}>{t(`${emptyKey}.description`)}</p>
              </div>
            ) : (
              <div className={styles.list}>
                {listToRender.map((item) =>
                  item.kind === "alert" ? (
                    <AlertRow
                      key={item.id}
                      alert={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={(id) => withBusy(id, markRead)}
                      onDelete={(id) => withBusy(id, remove)}
                      busy={busyIds.has(item.id)}
                    />
                  ) : item.kind === "activity" ? (
                    <ActivityRow
                      key={item.id}
                      item={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={(id) => withBusy(id, markActivityRead)}
                      onDelete={(id) => withBusy(id, removeActivity)}
                      busy={busyIds.has(item.id)}
                    />
                  ) : (
                    <RecommendationRow
                      key={item.id}
                      recommendation={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={(id) => withBusy(id, markRecommendationRead)}
                      onDelete={(id) => withBusy(id, removeRecommendation)}
                      busy={busyIds.has(item.id)}
                    />
                  ),
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {confirmClear && (
        <ConfirmModal
          title={t("actions.confirmClear.title")}
          message={t("actions.confirmClear.message", { count: clearable })}
          confirmLabel={t("actions.confirmClear.confirm")}
          cancelLabel={t("actions.confirmClear.cancel")}
          onConfirm={handleClear}
          onCancel={() => setConfirmClear(false)}
        />
      )}
    </div>
  );
};

/** Una cuenta de administración no tiene hogares: ve sus notificaciones de administrador. */
const Notifications = () => {
  const { isAdmin } = usePermissions();
  return isAdmin ? <AdminNotifications /> : <HomeNotifications />;
};

export default Notifications;
