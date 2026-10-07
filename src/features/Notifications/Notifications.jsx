import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Zap,
  AlertTriangle,
  WifiOff,
  Lightbulb,
  Check,
  CheckCheck,
} from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import ErrorState from "../../components/shared/ErrorState/ErrorState";
import { useHomes } from "../../context/useHomes";
import { listAlerts, resolveAlert, toUiAlert } from "../../services/alerts/alertApi";
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
  critical: Zap,
  warning: AlertTriangle,
};

const AlertRow = ({ alert, t, formatDate, onResolve }) => {
  const Icon = ALERT_ICONS[alert.type === "connectivity" ? "connectivity" : alert.severity];

  return (
    <div className={`${styles.row} ${alert.resolved ? styles.rowMuted : ""}`}>
      <div
        className={`${styles.icon} ${
          alert.severity === "critical" ? styles.iconDanger : styles.iconWarning
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
                  : styles.badgeWarning
            }`}
          >
            {alert.resolved ? t("status.resolved") : t("status.active")}
          </span>
        </div>

        <p className={styles.rowMessage}>
          {t(`${alert.key}.message`, { home: alert.home })}
        </p>

        <div className={styles.rowMeta}>
          <span>{alert.home}</span>
          <span className={styles.metaDot} />
          <span>{formatDate(alert.date)}</span>
        </div>
      </div>

      {!alert.resolved && (
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onResolve(alert.id)}
          >
            <Check size={13} />
            {t("status.resolved")}
          </button>
        </div>
      )}
    </div>
  );
};

const RecommendationRow = ({ recommendation, t, formatDate, onMarkRead }) => (
  <div className={`${styles.row} ${recommendation.read ? styles.rowMuted : ""}`}>
    <div className={`${styles.icon} ${styles.iconInfo}`}>
      <Lightbulb size={18} />
    </div>

    <div className={styles.rowBody}>
      <div className={styles.rowTop}>
        <p className={styles.rowTitle}>
          {t(`${recommendation.key}.title`)}
        </p>
        <span
          className={`${styles.badge} ${
            recommendation.read ? styles.badgeNeutral : styles.badgeInfo
          }`}
        >
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

    {!recommendation.read && (
      <div className={styles.rowActions}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => onMarkRead(recommendation.id)}
        >
          <Check size={13} />
          {t("actions.markRead")}
        </button>
      </div>
    )}
  </div>
);

const Notifications = () => {
  const { t, i18n } = useTranslation("notifications");
  const { homes, error: homesError, reload: reloadHomes } = useHomes();
  const [alertsError, setAlertsError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      homes.map((h) =>
        listAlerts(h.idHome).then((list) => list.map((a) => toUiAlert(a, h.name))),
      ),
    )
      .then((lists) => {
        if (cancelled) return;
        setAlertsError(null);
        setAlerts(lists.flat());
      })
      .catch((err) => !cancelled && setAlertsError(err));
    return () => {
      cancelled = true;
    };
  }, [homes, attempt]);

  const loadError = homesError ?? alertsError;
  const retry = () => (homesError ? reloadHomes() : setAttempt((n) => n + 1));

  const handleResolve = async (id) => {
    await resolveAlert(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
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

  const handleMarkRead = (id) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, read: true } : r)),
    );
  };

  const handleMarkAllRead = () => {
    setRecommendations((prev) => prev.map((r) => ({ ...r, read: true })));
  };

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;
  const unreadRecommendationsCount = recommendations.filter((r) => !r.read).length;

  const combinedList = useMemo(
    () =>
      [...alerts, ...recommendations].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
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
                    <span className={styles.tabCount}>
                      {unreadRecommendationsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab !== "alerts" && unreadRecommendationsCount > 0 && (
              <button
                type="button"
                className={styles.markAllBtn}
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} />
                {t("actions.markAllRead")}
              </button>
            )}
          </div>

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
                      onResolve={handleResolve}
                    />
                  ) : (
                    <RecommendationRow
                      key={item.id}
                      recommendation={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={handleMarkRead}
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
