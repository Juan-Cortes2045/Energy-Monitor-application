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
import styles from "./ConsumptionHistory.module.css";

const FILTERS = ["day", "week", "month", "year"];

const DEVICE_COLORS = [
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-secondary)",
  "var(--color-danger)",
  "#8B5CF6",
  "#F97316",
];

const DEVICES = [
  "Nevera",
  "Aire acondicionado",
  "Televisor",
  "Lavadora",
  "Iluminación",
  "Otros",
];

// Datos mock
const generateMockData = () => {
  const randomValue = (base, range) => Math.floor(Math.random() * range) + base;

  const day = Array.from({ length: 24 }, (_, i) => {
    const entry = { label: `${i}:00` };
    DEVICES.forEach((device) => {
      entry[device] = randomValue(0, 8);
    });
    return entry;
  });

  const week = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
    (dayName) => {
      const entry = { label: dayName };
      DEVICES.forEach((device) => {
        entry[device] = randomValue(5, 20);
      });
      return entry;
    }
  );

  const month = Array.from({ length: 30 }, (_, i) => {
    const entry = { label: String(i + 1).padStart(2, "0") };
    DEVICES.forEach((device) => {
      entry[device] = randomValue(10, 30);
    });
    return entry;
  });

  const year = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ].map((monthName) => {
    const entry = { label: monthName };
    DEVICES.forEach((device) => {
      entry[device] = randomValue(100, 200);
    });
    return entry;
  });

  return { day, week, month, year };
};

const mockData = generateMockData();
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

const ConsumptionHistory = () => {
  const { t } = useTranslation("history");

  const [activeFilter, setActiveFilter] = useState("month");
  const [activeSubFilter, setActiveSubFilter] = useState(null); // clave del subfiltro seleccionado
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Al cambiar el filtro principal, reiniciar subfiltro
  useEffect(() => {
    setActiveSubFilter(null);
  }, [activeFilter]);

  const fullData = mockData[activeFilter];

  // Aplicar subfiltro si existe
  const chartData = useMemo(() => {
    const subConfig = SUBFILTERS_CONFIG[activeFilter];
    if (!subConfig || !activeSubFilter) return fullData;

    const selected = subConfig.find((sf) => sf.key === activeSubFilter);
    if (!selected) return fullData;

    const [start, end] = selected.range;
    return fullData.slice(start, end);
  }, [fullData, activeFilter, activeSubFilter]);

  const devices = useMemo(() => {
    if (!chartData.length) return [];
    return Object.keys(chartData[0]).filter((key) => key !== "label");
  }, [chartData]);

  const rankingData = useMemo(() => {
    return devices.map((device, index) => {
      const total = chartData.reduce((acc, item) => acc + item[device], 0);
      return {
        nombre: device,
        total,
        color: DEVICE_COLORS[index % DEVICE_COLORS.length],
      };
    });
  }, [chartData, devices]);

  const totalPeriodo = rankingData.reduce((acc, item) => acc + item.total, 0);

  const needsScroll = chartData.length > 8;

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
        <p className={styles.date}>{t(`dates.${activeFilter}`)}</p>
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
          <div
            className={styles.chartWrapper}
            style={{ overflowX: needsScroll ? "auto" : "hidden" }}
          >
            <div
              className={styles.chartInner}
              style={{
                minWidth: needsScroll ? `${chartData.length * 55}px` : "100%",
              }}
        >
              <ResponsiveContainer width="100%" height={isMobile ? 300 : 440}>
                <BarChart data={chartData}>
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
                  {devices.map((device, index) => (
                    <Bar
                      key={device}
                      dataKey={device}
                      fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={isMobile ? 18 : 28}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        <div className={styles.legend}>
          {devices.map((device, index) => (
            <div key={device} className={styles.legendItem}>
              <span
                className={styles.legendDot}
                style={{
                  background: DEVICE_COLORS[index % DEVICE_COLORS.length],
                }}
              />
              <span className={styles.legendLabel}>{device}</span>
            </div>
          ))}
        </div>
      </div>
      </Card>

      {/* Ranking + Stats (sin cambios) */}
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
              <h3>{(totalPeriodo / chartData.length).toFixed(1)} kWh</h3>
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
    </div>
  );
};

export default ConsumptionHistory;