import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

import Card from "../../../design/components/Card/Card";
import styles from "./ConsumptionHistory.module.css";
import colors from "../../../design/tokens/colors";

const FILTERS = ["day", "week", "month", "year"];

const DEVICE_COLORS = [
  colors.primary,
  colors.warning,
  colors.secondary,
  colors.danger,
  "#8B5CF6",
  "#F97316",
  "#06B6D4",
];

const mockData = {
  day: Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    Nevera: Math.floor(Math.random() * 8) + 18,
    Iluminación: Math.floor(Math.random() * 6) + 10,
    TV: Math.floor(Math.random() * 4) + 2,
    Lavadora: Math.floor(Math.random() * 5),
  })),

  week: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => ({
    label: d,
    Nevera: Math.floor(Math.random() * 20) + 20,
    Iluminación: Math.floor(Math.random() * 12) + 10,
    TV: Math.floor(Math.random() * 8) + 4,
    Lavadora: Math.floor(Math.random() * 6),
  })),

  month: Array.from({ length: 30 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    Nevera: Math.floor(Math.random() * 10) + 20,
    Iluminación: Math.floor(Math.random() * 10) + 15,
    TV: Math.floor(Math.random() * 5) + 3,
    Lavadora: Math.floor(Math.random() * 5),
  })),

  year: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ].map((m) => ({
    label: m,
    Nevera: Math.floor(Math.random() * 120) + 200,
    Iluminación: Math.floor(Math.random() * 80) + 100,
    TV: Math.floor(Math.random() * 50) + 40,
    Lavadora: Math.floor(Math.random() * 40) + 20,
  })),
};

const ConsumptionHistory = () => {
  const { t } = useTranslation("history");

  const [activeFilter, setActiveFilter] = useState("month");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chartData = mockData[activeFilter];

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

  return (
    <div className={styles.page}>
      {/* TOP */}
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

      {/* CHART */}
      <Card
        style={{
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          padding: isMobile ? "16px 14px" : "24px",
        }}
      >
        <div className={styles.chartBlock}>
          <p className={styles.title}>{t("chart.title")}</p>

          <div className={styles.chartWrapper}>
            <div
              className={styles.chartInner}
              style={{
                width: isMobile ? `${chartData.length * 55}px` : "100%",
              }}
            >
              <ResponsiveContainer width="100%" height={isMobile ? 280 : 430}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={colors.border}
                  />

                  <XAxis dataKey="label" />
                  <YAxis />

                  <Tooltip />
                  <Legend />

                  {devices.map((device, index) => (
                    <Bar
                      key={device}
                      dataKey={device}
                      fill={DEVICE_COLORS[index % DEVICE_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        <Card
          style={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            padding: isMobile ? "16px 14px" : "24px",
          }}
        >
          <div className={styles.ranking}>
            <p className={styles.title}>{t("ranking.title")}</p>

            <div className={styles.table}>
              <div className={styles.tableContent}>
                <div className={styles.header}>
                  <span>{t("ranking.headers.position")}</span>
                  <span>{t("ranking.headers.device")}</span>
                  <span>{t("ranking.headers.total")}</span>
                  <span>{t("ranking.headers.percentage")}</span>
                </div>

                {rankingData.map((item, index) => {
                  const pct = ((item.total / totalPeriodo) * 100).toFixed(1);

                  return (
                    <div key={item.nombre} className={styles.row}>
                      <span>{index + 1}</span>
                      <span>{item.nombre}</span>
                      <span>{item.total.toFixed(1)}</span>

                      <div className={styles.percent}>
                        <div
                          className={styles.bar}
                          style={{
                            width: `${pct}%`,
                            background: item.color,
                          }}
                        />
                        <span>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* STATS */}
        <div className={styles.stats}>
          <Card>
            <div className={styles.stat}>
              <p>{t("stats.totalConsumption")}</p>
              <h3>{totalPeriodo.toFixed(1)} kWh</h3>
              <span>{t("stats.vsPrevious")}</span>
            </div>
          </Card>

          <Card>
            <div className={styles.stat}>
              <p>{t("stats.average")}</p>
              <h3>{(totalPeriodo / chartData.length).toFixed(1)} kWh</h3>
              <span>{t("stats.periodAverage")}</span>
            </div>
          </Card>

          <Card>
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
