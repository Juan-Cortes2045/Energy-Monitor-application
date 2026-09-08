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
  Trash2,
} from "lucide-react";

import Header from "../../design/components/Header/Header";
import Card from "../../design/components/Card/Card";
import styles from "./Notifications.module.css";

// ── Alertas generadas automáticamente a partir del análisis de las
// mediciones de consumo (ERF4.3) y del estado de conexión de los
// dispositivos (ERF5.3). El contenido se resuelve con i18n para que se
// traduzca correctamente; en producción vendrán ya generadas desde el
// backend, pero mientras no hay servicio conectado se simulan aquí. ──
const INITIAL_ALERTS = [
  {
    id: "a1",
    kind: "alert",
    type: "threshold",
    severity: "critical",
    key: "dailyLimit",
    project: "Casa Principal",
    device: "Nevera",
    date: "2026-07-07T09:12:00",
    resolved: false,
  },
  {
    id: "a2",
    kind: "alert",
    type: "connectivity",
    severity: "warning",
    key: "deviceOffline",
    project: "Casa Principal",
    device: "PC de escritorio",
    date: "2026-07-06T22:40:00",
    resolved: false,
  },
  {
    id: "a3",
    kind: "alert",
    type: "threshold",
    severity: "warning",
    key: "monthlyNearLimit",
    project: "Oficina Norte",
    device: "Lavadora",
    date: "2026-07-05T18:05:00",
    resolved: true,
  },
  {
    id: "a4",
    kind: "alert",
    type: "threshold",
    severity: "critical",
    key: "consumptionSpike",
    project: "Casa Principal",
    device: null,
    date: "2026-07-02T14:30:00",
    resolved: true,
  },
];

// ── Recomendaciones generadas a partir del comportamiento de consumo
// detectado, incluso sin situaciones críticas (ERF4.4). ──
const INITIAL_RECOMMENDATIONS = [
  {
    id: "r1",
    kind: "recommendation",
    key: "acPeak",
    project: "Casa Principal",
    device: "Aire acondicionado",
    date: "2026-07-07T08:00:00",
    read: false,
  },
  {
    id: "r2",
    kind: "recommendation",
    key: "standby",
    project: "Oficina Norte",
    date: "2026-07-04T12:00:00",
    read: false,
  },
  {
    id: "r3",
    kind: "recommendation",
    key: "improvement",
    project: "Casa Principal",
    date: "2026-07-01T09:00:00",
    read: true,
  },
];

const TABS = ["all", "alerts", "recommendations"];

const getAlertIcon = (alert) => {
  if (alert.type === "connectivity") return WifiOff;
  return alert.severity === "critical" ? Zap : AlertTriangle;
};

const AlertRow = ({ alert, t, formatDate, onResolve, onDelete }) => {
  const Icon = getAlertIcon(alert);

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
          <p className={styles.rowTitle}>{t(`mockAlerts.${alert.key}.title`)}</p>
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
          {t(`mockAlerts.${alert.key}.message`, {
            device: alert.device ?? "",
          })}
        </p>

        <div className={styles.rowMeta}>
          <span>{alert.project}</span>
          {alert.device && (
            <>
              <span className={styles.metaDot} />
              <span>{alert.device}</span>
            </>
          )}
          <span className={styles.metaDot} />
          <span>{formatDate(alert.date)}</span>
        </div>
      </div>

      {/* Una alerta activa solo se puede resolver; el sistema aún no
          confirmó que la situación se solucionó, así que no se puede
          eliminar todavía. Una vez resuelta, sí se puede quitar de la lista. */}
      <div className={styles.rowActions}>
        {!alert.resolved ? (
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => onResolve(alert.id)}
          >
            <Check size={13} />
            {t("actions.resolve")}
          </button>
        ) : (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDelete(alert.id)}
            aria-label={t("actions.delete")}
            title={t("actions.delete")}
          >
            <Trash2 size={14} />
          </button>
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
        <p className={styles.rowTitle}>
          {t(`mockRecommendations.${recommendation.key}.title`)}
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
        {t(`mockRecommendations.${recommendation.key}.message`)}
      </p>

      <div className={styles.rowMeta}>
        <span>{recommendation.project}</span>
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

    {/* Las recomendaciones no requieren que el sistema confirme nada:
        se pueden descartar en cualquier momento. */}
    <div className={styles.rowActions}>
      {!recommendation.read && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => onMarkRead(recommendation.id)}
        >
          <Check size={13} />
          {t("actions.markRead")}
        </button>
      )}
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={() => onDelete(recommendation.id)}
        aria-label={t("actions.delete")}
        title={t("actions.delete")}
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

const Notifications = () => {
  const { t, i18n } = useTranslation("notifications");
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);
  const [activeTab, setActiveTab] = useState("all");

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

  const handleResolveAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)),
    );
  };

  const handleMarkRead = (id) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, read: true } : r)),
    );
  };

  const handleMarkAllRead = () => {
    setRecommendations((prev) => prev.map((r) => ({ ...r, read: true })));
  };

  // Una alerta solo se puede eliminar una vez resuelta (el sistema ya
  // detectó que la situación se solucionó); una recomendación se puede
  // descartar en cualquier momento. La guarda "!a.resolved" es una
  // defensa adicional, ya que el botón de eliminar de una alerta activa
  // ni siquiera se renderiza.
  const handleDeleteAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => !(a.id === id && a.resolved)));
  };

  const handleDeleteRecommendation = (id) => {
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
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
            {listToRender.length === 0 ? (
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
                      onResolve={handleResolveAlert}
                      onDelete={handleDeleteAlert}
                    />
                  ) : (
                    <RecommendationRow
                      key={item.id}
                      recommendation={item}
                      t={t}
                      formatDate={formatDate}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDeleteRecommendation}
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
