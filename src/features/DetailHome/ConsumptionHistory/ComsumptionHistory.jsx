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
import { useTheme } from "../../../context/ThemeContext";
import styles from "./ConsumptionHistory.module.css";

const FILTERS = ["day", "week", "month", "year"];

const pad = (n) => String(n).padStart(2, "0");
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Los puntos se identifican con fechas reales en formato neutro (nada de
// nombres de día o mes): day → hora (0-23), week/month → "YYYY-MM-DD",
// year → "YYYY-MM". Las etiquetas se generan al renderizar, con el idioma activo.
const generateMockData = (categoryTypes, now = new Date()) => {
  const randomValue = (base, range) => Math.floor(Math.random() * range) + base;
  const makePoint = (key, base, range) => {
    const entry = { key };
    categoryTypes.forEach((type) => {
      entry[type] = randomValue(base, range);
    });
    return entry;
  };

  const day = Array.from({ length: 24 }, (_, i) => makePoint(i, 0, 8));

  const week = Array.from({ length: 7 }, (_, i) =>
    makePoint(
      isoDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i))),
      5,
      20
    )
  );

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const month = Array.from({ length: daysInMonth }, (_, i) =>
    makePoint(isoDay(new Date(now.getFullYear(), now.getMonth(), i + 1)), 10, 30)
  );

  const year = Array.from({ length: 12 }, (_, i) =>
    makePoint(`${now.getFullYear()}-${pad(i + 1)}`, 100, 200)
  );

  return { day, week, month, year };
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

const ConsumptionHistory = ({ devices }) => {
  const { t, i18n } = useTranslation("history");
  const { currentTheme } = useTheme();

  const [activeFilter, setActiveFilter] = useState("month");
  const [activeSubFilter, setActiveSubFilter] = useState(null); // clave del subfiltro seleccionado
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [manualSelectedType, setManualSelectedType] = useState(null); // null = seguir al top consumer

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Al cambiar el filtro principal, reiniciar subfiltro
  useEffect(() => {
    setActiveSubFilter(null);
  }, [activeFilter]);

  // Al cambiar de periodo (filtro o subfiltro), volver a seguir al top
  // consumer en vez de conservar la elección manual del periodo anterior.
  useEffect(() => {
    setManualSelectedType(null);
  }, [activeFilter, activeSubFilter]);

  // Tipos de dispositivo realmente vinculados en el hogar, en orden
  // canónico (mismo orden que usa Consumption.jsx) para poder comparar
  // ambas pestañas de un vistazo.
  const categoryTypes = useMemo(() => {
    const present = new Set(devices.map((d) => d.applianceType));
    return APPLIANCE_TYPE_IDS.filter((id) => present.has(id));
  }, [devices]);

  // Los valores dependen solo de los tipos de dispositivo; el idioma no
  // interviene aquí, así que cambiarlo no regenera los datos aleatorios.
  const mockDataByFilter = useMemo(
    () => generateMockData(categoryTypes),
    [categoryTypes]
  );

  const fullData = mockDataByFilter[activeFilter];

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
      value: row[selectedType],
    }));
  }, [rows, selectedType, activeFilter, i18n.language]);

  // Encabezado: mes/año se calculan del primer y último punto del periodo;
  // día/semana usan los textos relativos traducidos.
  const dateRangeText = useMemo(() => {
    const options = RANGE_OPTIONS[activeFilter];
    if (!options) return t(`dates.${activeFilter}`);
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

  const needsScroll = timeSeriesData.length > 8;

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
        <p className={styles.date}>{dateRangeText}</p>
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
              <span>{t("stats.vsPrevious")}</span>
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
              <h3>{rankingData[0]?.nombre}</h3>
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
