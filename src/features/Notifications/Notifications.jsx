import { useMemo, useState } from "react";
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
import styles from "./Notifications.module.css";
import { useNotifications } from "./useNotifications";
import { markRecommendationRead } from "../../services/recommendation.service";
import { useHomes } from "../../context/HomeContext";
import LoadingState from "../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../components/shared/ErrorState/ErrorState";

const TABS = ["all", "alerts", "recommendations"];

const getAlertIcon = (alert) => {
  if (alert.type === "CONNECTIVITY") return WifiOff;
  return alert.severity === "CRITICAL" ? Zap : AlertTriangle;
};

const AlertRow = ({ alert, homeName, t, formatDate }) => {
  const Icon = getAlertIcon(alert);
  const resolved = alert.alert_status === "RESOLVED";
  const [messageNs, messageKey] = alert.message_key.split(".");

  return (
    <div className={`${styles.row} ${resolved ? styles.rowMuted : ""}`}>
      <div
        className={`${styles.icon} ${
          alert.severity === "CRITICAL" ? styles.iconDanger : styles.iconWarning
        }`}
      >
        <Icon size={18} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <p className={styles.rowTitle}>{t(`${messageNs}.${messageKey}.title`)}</p>
          <span
            className={`${styles.badge} ${
              resolved
                ? styles.badgeNeutral
                : alert.severity === "CRITICAL"
                  ? styles.badgeDanger
                  : styles.badgeWarning
            }`}
          >
            {resolved ? t("status.resolved") : t("status.active")}
          </span>
        </div>

        <p className={styles.rowMessage}>
          {t(`${messageNs}.${messageKey}.message`, { home: homeName })}
        </p>

        <div className={styles.rowMeta}>
          <span>{homeName}</span>
          <span className={styles.metaDot} />
          <span>{formatDate(alert.date_time)}</span>
        </div>
      </div>
    </div>
  );
};

const RecommendationRow = ({ recommendation, homeName, t, formatDate, onMarkRead }) => {
  const read = recommendation.status === "READ";
  const [messageNs, messageKey] = recommendation.message_key.split(".");

  return (
    <div className={`${styles.row} ${read ? styles.rowMuted : ""}`}>
      <div className={`${styles.icon} ${styles.iconInfo}`}>
        <Lightbulb size={18} />
      </div>

      <div className={styles.rowBody}>
        <div className={styles.rowTop}>
          <p className={styles.rowTitle}>
            {t(`${messageNs}.${messageKey}.title`)}
          </p>
          <span
            className={`${styles.badge} ${read ? styles.badgeNeutral : styles.badgeInfo}`}
          >
            {read ? t("status.read") : t("status.new")}
          </span>
        </div>

        <p className={styles.rowMessage}>
          {t(`${messageNs}.${messageKey}.message`, { home: homeName })}
        </p>

        <div className={styles.rowMeta}>
          <span>{homeName}</span>
          <span className={styles.metaDot} />
          <span>{formatDate(recommendation.date_time)}</span>
        </div>
      </div>

      <div className={styles.rowActions}>
        {!read && (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onMarkRead(recommendation.id)}
          >
            <Check size={13} />
            {t("actions.markRead")}
          </button>
        )}
      </div>
    </div>
  );
};

const Notifications = () => {
  const { t, i18n } = useTranslation("notifications");
  const { homes } = useHomes();
  const { data, loading, error, refetch } = useNotifications();
  const [activeTab, setActiveTab] = useState("all");

  const homeNameById = useMemo(() => Object.fromEntries(homes.map((h) => [h.id, h.name])), [homes]);

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

  const handleMarkRead = async (id) => {
    await markRecommendationRead(id);
    await refetch();
  };

  const handleMarkAllRead = async () => {
    const unread = data.recommendations.filter((r) => r.status !== "READ");
    await Promise.all(unread.map((r) => markRecommendationRead(r.id)));
    await refetch();
  };

  const activeAlertsCount = data.alerts.filter((a) => a.alert_status !== "RESOLVED").length;
  const unreadRecommendationsCount = data.recommendations.filter((r) => r.status !== "READ").length;

  const alertItems = data.alerts.map((a) => ({ ...a, kind: "alert", date: a.date_time }));
  const recommendationItems = data.recommendations.map((r) => ({ ...r, kind: "recommendation", date: r.date_time }));

  const combinedList = useMemo(
    () => [...alertItems, ...recommendationItems].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [alertItems, recommendationItems],
  );

  const listToRender =
    activeTab === "alerts"
      ? [...alertItems].sort((a, b) => new Date(b.date) - new Date(a.date))
      : activeTab === "recommendations"
        ? [...recommendationItems].sort((a, b) => new Date(b.date) - new Date(a.date))
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
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={refetch} />
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
                      homeName={homeNameById[item.home_id] ?? ""}
                      t={t}
                      formatDate={formatDate}
                    />
                  ) : (
                    <RecommendationRow
                      key={item.id}
                      recommendation={item}
                      homeName={homeNameById[item.home_id] ?? ""}
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
