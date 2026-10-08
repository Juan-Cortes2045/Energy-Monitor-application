import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Zap,
  AlertTriangle,
  WifiOff,
  CircuitBoard,
  Lightbulb,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
} from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import ErrorState from "../../components/shared/ErrorState/ErrorState";
import { useHomes } from "../../context/useHomes";
import { useNotificationCenter } from "../../context/useNotificationCenter";
import styles from "./Notifications.module.css";

// TODO: el backend aún no expone recomendaciones; estos datos son de ejemplo.
// ── Recomendaciones generadas a partir del comportamiento de consumo
// detectado, incluso sin situaciones críticas (ERF4.4). ──
const INITIAL_RECOMMENDATIONS = [
  {
    id: "r1",
    kind: "recommendation",
    key: "recommendation.shiftUsageOffPeak",
    home: "Casa Principal",
    date: "2026-07-07T08:00:00",
    read: false,
  },
  {
    id: "r2",
    kind: "recommendation",
    key: "recommendation.reduceStandby",
    home: "Oficina Norte",
    date: "2026-07-04T12:00:00",
    read: false,
  },
  {
    id: "r3",
    kind: "recommendation",
    key: "recommendation.scheduleMaintenance",
    home: "Casa Principal",
    date: "2026-07-01T09:00:00",
    read: true,
  },
  {
    id: "r4",
    kind: "recommendation",
    key: "recommendation.upgradeAppliance",
    home: "Oficina Norte",
    date: "2026-06-28T10:00:00",
    read: true,
  },
];

const TABS = ["all", "alerts", "recommendations"];

const ALERT_ICONS = {
  connectivity: WifiOff,
  device: CircuitBoard,
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

const RecommendationRow = ({ recommendation, t, formatDate, onMarkRead, onDelete }) => (
  <div className={`${styles.row} ${recommendation.read ? styles.rowMuted : ""}`}>
    <div className={`${styles.icon} ${styles.iconInfo}`}>
      <Lightbulb size={18} />
    </div>

    <div className={styles.rowBody}>
      <div className={styles.rowTop}>
        <p className={styles.rowTitle}>{t(`${recommendation.key}.title`)}</p>
        <span className={`${styles.badge} ${recommendation.read ? styles.badgeNeutral : styles.badgeInfo}`}>
          {recommendation.read ? t("status.read") : t("status.new")}
        </span>
      </div>

      <p className={styles.rowMessage}>
        {t(`${recommendation.key}.message`, { home: recommendation.home })}
      </p>

      <div className={styles.rowMeta}>
        <span>{recommendation.home}</span>
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
        />
      ) : (
        <RowButton
          icon={<Check size={13} />}
          label={t("actions.markRead")}
          onClick={() => onMarkRead(recommendation.id)}
        />
      )}
    </div>
  </div>
);

const Notifications = () => {
  const { t, i18n } = useTranslation("notifications");
  const { error: homesError, reload: reloadHomes } = useHomes();
  const {
    alerts,
    error: alertsError,
    reload: reloadAlerts,
    markRead,
    remove,
    removeAllResolved,
  } = useNotificationCenter();
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [activeTab, setActiveTab] = useState("all");

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

  // Recomendaciones: el módulo aún no existe en el backend, viven en memoria.
  const markRecommendationRead = (id) =>
    setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
  const deleteRecommendation = (id) => setRecommendations((prev) => prev.filter((r) => r.id !== id));
  const markAllRecommendationsRead = () =>
    setRecommendations((prev) => prev.map((r) => ({ ...r, read: true })));

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const unreadRecommendationsCount = recommendations.filter((r) => !r.read).length;

  // "Eliminar resueltas" actúa sobre lo que se ve en la pestaña actual.
  const clearableAlerts = activeTab === "recommendations" ? 0 : alerts.filter((a) => a.resolved).length;
  const clearableRecommendations = activeTab === "alerts" ? 0 : recommendations.filter((r) => r.read).length;
  const clearable = clearableAlerts + clearableRecommendations;

  const handleClear = async () => {
    setClearing(true);
    setActionError(null);
    try {
      if (clearableRecommendations) setRecommendations((prev) => prev.filter((r) => !r.read));
      if (clearableAlerts) await removeAllResolved();
    } catch (err) {
      setActionError(err);
    } finally {
      setClearing(false);
    }
  };

  const combinedList = useMemo(
    () => [...alerts, ...recommendations].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [alerts, recommendations],
  );

  const listToRender =
    activeTab === "alerts"
      ? [...alerts].sort((a, b) => new Date(b.date) - new Date(a.date))
      : activeTab === "recommendations"
        ? [...recommendations].sort((a, b) => new Date(b.date) - new Date(a.date))
        : combinedList;

  const emptyKey =
    activeTab === "alerts"
      ? "empty.alerts"
      : activeTab === "recommendations"
        ? "empty.recommendations"
        : "empty.all";

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
                >
                  {t(`tabs.${tab}`)}
                  {tab === "alerts" && activeAlertsCount > 0 && (
                    <span className={styles.tabCount}>{activeAlertsCount}</span>
                  )}
                  {tab === "recommendations" && unreadRecommendationsCount > 0 && (
                    <span className={styles.tabCount}>{unreadRecommendationsCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className={styles.tabs}>
              {activeTab !== "alerts" && unreadRecommendationsCount > 0 && (
                <button type="button" className={styles.markAllBtn} onClick={markAllRecommendationsRead}>
                  <CheckCheck size={14} />
                  {t("actions.markAllRead")}
                </button>
              )}
              {clearable > 0 && (
                <button
                  type="button"
                  className={styles.markAllBtn}
                  onClick={handleClear}
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
                  ) : (
                    <RecommendationRow
                      key={item.id}
                      recommendation={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={markRecommendationRead}
                      onDelete={deleteRecommendation}
                    />
                  ),
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
