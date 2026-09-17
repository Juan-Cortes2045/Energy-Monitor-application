import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

import Card from "../../../design/components/Card/Card";
import { getDeviceColor } from "../shared/deviceChartConfig";
import { useApplianceTypes } from "../shared/useApplianceTypes";
import EmptyChart from "../shared/EmptyChart";
import { useTheme } from "../../../context/ThemeContext";
import { useConsumptionHistory } from "./useConsumptionHistory";
import LoadingState from "../../../components/shared/LoadingState/LoadingState";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import styles from "./ConsumptionHistory.module.css";

const FILTERS = ["day", "week", "month", "year"];

// Same-length slices of the range already returned by the server (24
// hours/day, 30 days/month, 12 months/year) — no separate endpoint needed
// per sub-range, this only narrows which buckets of the fetched array are
// summed/charted.
const SUBFILTERS_CONFIG = {
  day: [
    { key: "0-6", range: [0, 6] },
    { key: "6-12", range: [6, 12] },
    { key: "12-18", range: [12, 18] },
    { key: "18-24", range: [18, 24] },
  ],
  week: null,
  month: [
    { key: "sem1", range: [0, 7] },
    { key: "sem2", range: [7, 14] },
    { key: "sem3", range: [14, 21] },
    { key: "sem4", range: [21, 30] },
  ],
  year: [
    { key: "q1", range: [0, 3] },
    { key: "q2", range: [3, 6] },
    { key: "q3", range: [6, 9] },
    { key: "q4", range: [9, 12] },
  ],
};

function formatBucketLabel(range, label, locale) {
  if (range === "day") return `${label}:00`;
  if (range === "year") {
    const [year, month] = label.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(year, month - 1, 1));
  }
  // week / month: label is an ISO "YYYY-MM-DD" date
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(new Date(`${label}T00:00:00`));
}

function formatRangeHint(range, buckets, locale, t) {
  if (range === "day") return t("dates.day");
  if (range === "week") return t("dates.week");
  if (buckets.length === 0) return "";
  const first = buckets[0].label;
  const last = buckets[buckets.length - 1].label;
  const formatter =
    range === "year"
      ? new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" })
      : new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "2-digit" });
  const toDate = (value) => (range === "year" ? new Date(`${value}-01T00:00:00`) : new Date(`${value}T00:00:00`));
  return `${formatter.format(toDate(first))} - ${formatter.format(toDate(last))}`;
}

const ConsumptionHistory = ({ homeId }) => {
  const { t, i18n } = useTranslation("history");
  const { t: tDevices } = useTranslation("devices");
  const { currentTheme } = useTheme();
  const { nameOf } = useApplianceTypes();

  const [activeFilter, setActiveFilter] = useState("month");
  const [activeSubFilter, setActiveSubFilter] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [manualSelectedType, setManualSelectedType] = useState(null); // null = follow top consumer

  const { data: buckets, loading, error, refetch } = useConsumptionHistory(homeId, activeFilter);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setActiveSubFilter(null);
  }, [activeFilter]);

  useEffect(() => {
    setManualSelectedType(null);
  }, [activeFilter, activeSubFilter]);

  // appliance_type_id keys present across every bucket (a home with no
  // linked devices returns an empty array of buckets, so this is []).
  const categoryTypeIds = useMemo(() => {
    if (buckets.length === 0) return [];
    return Object.keys(buckets[0]).filter((key) => key !== "label");
  }, [buckets]);

  const rows = useMemo(() => {
    const subConfig = SUBFILTERS_CONFIG[activeFilter];
    if (subConfig && activeSubFilter) {
      const selected = subConfig.find((sf) => sf.key === activeSubFilter);
      if (selected) {
        const [start, end] = selected.range;
        return buckets.slice(start, end);
      }
    }
    return buckets;
  }, [buckets, activeFilter, activeSubFilter]);

  const categoryTotals = useMemo(
    () =>
      categoryTypeIds.map((typeId) => ({
        typeId,
        name: tDevices(`applianceTypes.${nameOf(typeId)}`),
        total: rows.reduce((sum, row) => sum + (row[typeId] ?? 0), 0),
      })),
    [rows, categoryTypeIds, tDevices, nameOf],
  );

  const topConsumerTypeId = useMemo(() => {
    if (!categoryTotals.length) return null;
    return [...categoryTotals].sort((a, b) => b.total - a.total)[0].typeId;
  }, [categoryTotals]);

  const selectedTypeId = manualSelectedType ?? topConsumerTypeId;

  const timeSeriesData = useMemo(() => {
    if (!selectedTypeId) return [];
    return rows.map((row) => ({
      label: formatBucketLabel(activeFilter, row.label, i18n.language),
      value: row[selectedTypeId] ?? 0,
    }));
  }, [rows, selectedTypeId, activeFilter, i18n.language]);

  const rankingData = useMemo(
    () =>
      [...categoryTotals]
        .sort((a, b) => b.total - a.total)
        .map((entry) => ({
          name: entry.name,
          total: entry.total,
          color: getDeviceColor(nameOf(entry.typeId), currentTheme.mode),
        })),
    [categoryTotals, currentTheme.mode, nameOf],
  );

  const totalPeriodo = rankingData.reduce((acc, item) => acc + item.total, 0);
  const needsScroll = timeSeriesData.length > 8;
  const rangeHint = formatRangeHint(activeFilter, buckets, i18n.language, t);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className={styles.page}>
      {/* Filtros principales */}
      <div className={styles.topBar}>
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={activeFilter === filter ? styles.active : ""}
            >
              {t(`filters.${filter}`)}
            </button>
          ))}
        </div>
        <p className={styles.date}>{rangeHint}</p>
      </div>

      {SUBFILTERS_CONFIG[activeFilter] && (
      <div className={styles.subFilters}>
        {SUBFILTERS_CONFIG[activeFilter].map((sf) => (
          <button
            key={sf.key}
            onClick={() => setActiveSubFilter(sf.key)}
            className={activeSubFilter === sf.key ? styles.subActive : ""}
          >
            {t(`subfilters.${activeFilter}.${sf.key}`)}
          </button>
        ))}
        {activeSubFilter && (
          <button
            onClick={() => setActiveSubFilter(null)}
            className={styles.clearSubFilter}
          >
            {t("subfilters.showAll")}
          </button>
        )}
      </div>
    )}

      {/* Gráfico */}
      <Card className={styles.chartCard}>
        <div className={styles.chartBlock}>
          <p className={styles.title}>{t("chart.title")}</p>

          {categoryTypeIds.length > 0 && (
            <div className={styles.deviceSelector}>
              {categoryTypeIds.map((typeId) => (
                <button
                  key={typeId}
                  onClick={() => setManualSelectedType(typeId)}
                  className={selectedTypeId === typeId ? styles.deviceActive : ""}
                >
                  <span
                    className={styles.deviceDot}
                    style={{ background: getDeviceColor(nameOf(typeId), currentTheme.mode) }}
                  />
                  {tDevices(`applianceTypes.${nameOf(typeId)}`)}
                </button>
              ))}
            </div>
          )}

          {timeSeriesData.length === 0 ? (
            <EmptyChart mensaje={t("chart.empty")} />
          ) : (
            <div
              className={styles.chartWrapper}
              style={{ overflowX: needsScroll ? "auto" : "hidden" }}
            >
              <div
                className={styles.chartInner}
                style={{
                  minWidth: needsScroll ? `${timeSeriesData.length * 55}px` : "100%",
                }}
              >
                <ResponsiveContainer width="100%" height={isMobile ? 300 : 440}>
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
                      axisLine={false}
                      tickLine={false}
                      unit=" kWh"
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--color-border)",
                        fontSize: 12,
                        fontFamily: "var(--font-primary)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={getDeviceColor(nameOf(selectedTypeId), currentTheme.mode)}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 18 : 28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Ranking + Stats */}
      {categoryTotals.length > 0 && (
      <div className={styles.bottom}>
        <Card className={styles.rankingCard}>
          <div className={styles.ranking}>
            <p className={styles.title}>{t("ranking.title")}</p>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <span>#</span>
                <span>{t("ranking.headers.device")}</span>
                <span>{t("ranking.headers.total")}</span>
                <span>{t("ranking.headers.percentage")}</span>
              </div>
              {rankingData.map((item, index) => {
                const pct = totalPeriodo
                  ? ((item.total / totalPeriodo) * 100).toFixed(1)
                  : "0.0";
                return (
                  <div key={item.name} className={styles.row}>
                    <span>{index + 1}</span>
                    <span>{item.name}</span>
                    <span>{item.total.toFixed(1)} kWh</span>
                    <div className={styles.percent}>
                      <div
                        className={styles.bar}
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                      <span>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className={styles.stats}>
          <Card className={styles.statCard}>
            <div className={styles.stat}>
              <p>{t("stats.totalConsumption")}</p>
              <h3>{totalPeriodo.toFixed(1)} kWh</h3>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.stat}>
              <p>{t("stats.average")}</p>
              <h3>
                {(totalPeriodo / (categoryTotals.length || 1)).toFixed(1)} kWh
              </h3>
              <span>{t("stats.periodAverage")}</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.stat}>
              <p>{t("stats.topConsumer")}</p>
              <h3>{rankingData[0]?.name}</h3>
              <span>{rankingData[0]?.total.toFixed(1)} kWh</span>
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default ConsumptionHistory;
