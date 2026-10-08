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
import { APPLIANCE_TYPE_IDS } from "../shared/deviceTypes";
import { getDeviceColor } from "../shared/deviceChartConfig";
import EmptyChart from "../shared/EmptyChart";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import { deviceApi } from "../../../services/devices";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./ConsumptionHistory.module.css";

const FILTERS = ["day", "week", "month", "year"];


// Los puntos llegan del backend con claves neutras: day → hora local ("0".."23"),
// week/month → "YYYY-MM-DD", year → "YYYY-MM". Las etiquetas se generan al
// renderizar, con el idioma activo.
const toRows = (history, devices, categoryTypes) => {
  const typeByDevice = new Map(devices.map((d) => [d.id, d.applianceType]));
  return history.buckets.map((bucket) => {
    const entry = { key: history.period === "day" ? Number(bucket.key) : bucket.key };
    categoryTypes.forEach((type) => {
      entry[type] = 0;
    });
    bucket.devices.forEach(({ deviceId, energy }) => {
      const type = typeByDevice.get(deviceId);
      if (type) entry[type] = (entry[type] ?? 0) + energy;
    });
    return entry;
  });
};

// "YYYY-MM-DD" / "YYYY-MM" / hora → Date local (evita el desfase UTC de new Date("YYYY-MM-DD")).
const keyToDate = (key) => {
  if (typeof key === "number") return new Date(2000, 0, 1, key);
  const [y, m, d = 1] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const LABEL_OPTIONS = {
  day: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
  week: { weekday: "short" },
  month: { day: "2-digit" },
  year: { month: "short" },
};

const RANGE_OPTIONS = {
  month: { day: "numeric", month: "long", year: "numeric" },
  year: { month: "long", year: "numeric" },
};

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
    { key: "sem4", range: [21, Infinity] },
  ],
  year: [
    { key: "q1", range: [0, 3] },
    { key: "q2", range: [3, 6] },
    { key: "q3", range: [6, 9] },
    { key: "q4", range: [9, 12] },
  ],
};

const ConsumptionHistory = ({ homeId, devices }) => {
  const { t, i18n } = useTranslation("history");
  const { currentTheme } = useTheme();

  const [activeFilter, setActiveFilter] = useState("month");
  const [activeSubFilter, setActiveSubFilter] = useState(null); // clave del subfiltro seleccionado
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [manualSelectedType, setManualSelectedType] = useState(null); // null = seguir al top consumer
  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    deviceApi
      .getConsumptionHistory(homeId, activeFilter)
      .then((data) => {
        if (cancelled) return;
        setHistory(data);
        setHistoryError(null);
      })
      .catch((err) => !cancelled && setHistoryError(err));
    return () => {
      cancelled = true;
    };
  }, [homeId, activeFilter, attempt]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Al cambiar de periodo (filtro o subfiltro) se reinicia el subfiltro y se
  // vuelve a seguir al top consumer en vez de conservar la elección manual.
  const selectFilter = (filter) => {
    setActiveFilter(filter);
    setActiveSubFilter(null);
    setManualSelectedType(null);
  };
  const selectSubFilter = (subFilter) => {
    setActiveSubFilter(subFilter);
    setManualSelectedType(null);
  };

  // Tipos de dispositivo realmente vinculados en el hogar, en orden
  // canónico (mismo orden que usa Consumption.jsx) para poder comparar
  // ambas pestañas de un vistazo.
  const categoryTypes = useMemo(() => {
    const present = new Set(devices.map((d) => d.applianceType));
    return APPLIANCE_TYPE_IDS.filter((id) => present.has(id));
  }, [devices]);

  // Mientras llega el periodo pedido se conserva el anterior solo si es del mismo filtro.
  const fullData = useMemo(
    () =>
      history && history.period === activeFilter ? toRows(history, devices, categoryTypes) : [],
    [history, activeFilter, devices, categoryTypes]
  );

  // Filas del rango de tiempo seleccionado (recorte por subfiltro, igual
  // que antes). De aquí se derivan tanto los totales por categoría
  // (ranking/stats) como la serie temporal del dispositivo seleccionado
  // (gráfico).
  const rows = useMemo(() => {
    const subConfig = SUBFILTERS_CONFIG[activeFilter];
    if (subConfig && activeSubFilter) {
      const selected = subConfig.find((sf) => sf.key === activeSubFilter);
      if (selected) {
        const [start, end] = selected.range;
        return fullData.slice(start, end);
      }
    }
    return fullData;
  }, [fullData, activeFilter, activeSubFilter]);

  const categoryTotals = useMemo(() => {
    return categoryTypes.map((type) => ({
      type,
      name: t(`applianceTypes.${type}`, { ns: "devices" }),
      total: rows.reduce((sum, row) => sum + row[type], 0),
    }));
  }, [rows, categoryTypes, t, i18n.language]);

  const topConsumerType = useMemo(() => {
    if (!categoryTotals.length) return null;
    return [...categoryTotals].sort((a, b) => b.total - a.total)[0].type;
  }, [categoryTotals]);

  const selectedType = manualSelectedType ?? topConsumerType;

  // Serie temporal (una barra por punto de tiempo) del dispositivo
  // actualmente seleccionado.
  const timeSeriesData = useMemo(() => {
    if (!selectedType) return [];
    const formatter = new Intl.DateTimeFormat(i18n.language, LABEL_OPTIONS[activeFilter]);
    return rows.map((row) => ({
      label: formatter.format(keyToDate(row.key)),
      value: Number((row[selectedType] ?? 0).toFixed(3)),
    }));
  }, [rows, selectedType, activeFilter, i18n.language]);

  // Encabezado: mes/año se calculan del primer y último punto del periodo;
  // día/semana usan los textos relativos traducidos.
  const dateRangeText = useMemo(() => {
    const options = RANGE_OPTIONS[activeFilter];
    if (!options || fullData.length === 0) return t(`dates.${activeFilter}`);
    return new Intl.DateTimeFormat(i18n.language, options).formatRange(
      keyToDate(fullData[0].key),
      keyToDate(fullData[fullData.length - 1].key)
    );
  }, [activeFilter, fullData, t, i18n.language]);

  const rankingData = useMemo(() => {
    return [...categoryTotals]
      .sort((a, b) => b.total - a.total)
      .map((entry) => ({
        nombre: entry.name,
        total: entry.total,
        color: getDeviceColor(entry.type, currentTheme.mode),
      }));
  }, [categoryTotals, currentTheme.mode]);

  const totalPeriodo = rankingData.reduce((acc, item) => acc + item.total, 0);

  // Comparación con el periodo anterior completo (ayer, los 7 días previos, el mes
  // o el año pasado). Solo tiene sentido sobre el periodo entero, sin subfiltro.
  const previousTotal = history?.period === activeFilter ? history.previousTotal : null;
  const comparison =
    activeSubFilter || previousTotal == null
      ? null
      : previousTotal === 0
        ? t("stats.noPrevious")
        : (() => {
            const pct = Math.round(((totalPeriodo - previousTotal) / previousTotal) * 100);
            return t("stats.vsPrevious", { sign: pct > 0 ? "↑" : pct < 0 ? "↓" : "=", pct: Math.abs(pct) });
          })();

  const needsScroll = timeSeriesData.length > 8;

  return (
    <div className={styles.page}>
      {/* Filtros principales */}
      <div className={styles.topBar}>
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => selectFilter(filter)}
              className={activeFilter === filter ? styles.active : ""}
            >
              {t(`filters.${filter}`)}
            </button>
          ))}
        </div>
        <p className={styles.date}>{dateRangeText}</p>
      </div>

      {SUBFILTERS_CONFIG[activeFilter] && (
      <div className={styles.subFilters}>
        {SUBFILTERS_CONFIG[activeFilter].map((sf) => (
          <button
            key={sf.key}
            onClick={() => selectSubFilter(sf.key)}
            className={activeSubFilter === sf.key ? styles.subActive : ""}
          >
            {t(`subfilters.${activeFilter}.${sf.key}`)}
          </button>
        ))}
        {activeSubFilter && (
          <button
            onClick={() => selectSubFilter(null)}
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

          {categoryTypes.length > 0 && (
            <div className={styles.deviceSelector}>
              {categoryTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setManualSelectedType(type)}
                  className={selectedType === type ? styles.deviceActive : ""}
                >
                  <span
                    className={styles.deviceDot}
                    style={{ background: getDeviceColor(type, currentTheme.mode) }}
                  />
                  {t(`applianceTypes.${type}`, { ns: "devices" })}
                </button>
              ))}
            </div>
          )}

          {historyError ? (
            <ErrorState error={historyError} onRetry={() => setAttempt((n) => n + 1)} />
          ) : timeSeriesData.length === 0 ? (
            <EmptyChart mensaje={t(devices.length ? "chart.noData" : "chart.empty")} />
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
                      fill={getDeviceColor(selectedType, currentTheme.mode)}
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
                  <div key={item.nombre} className={styles.row}>
                    <span>{index + 1}</span>
                    <span>{item.nombre}</span>
                    <span>{item.total.toFixed(2)} kWh</span>
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
              <h3>{totalPeriodo.toFixed(2)} kWh</h3>
              <span>{comparison ?? t("stats.periodTotal")}</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.stat}>
              <p>{t("stats.average")}</p>
              <h3>
                {(totalPeriodo / (categoryTotals.length || 1)).toFixed(2)} kWh
              </h3>
              <span>{t("stats.periodAverage")}</span>
            </div>
          </Card>
          <Card className={styles.statCard}>
            <div className={styles.stat}>
              <p>{t("stats.topConsumer")}</p>
              <h3>{rankingData[0]?.nombre}</h3>
              <span>{rankingData[0]?.total.toFixed(2)} kWh</span>
            </div>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default ConsumptionHistory;
