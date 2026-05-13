import { useMemo, useState } from "react";

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

const FILTERS = ["Día", "Semana", "Mes", "Año"];

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
  Día: Array.from({ length: 24 }, (_, i) => ({
    label: `${i}:00`,
    Nevera: Math.floor(Math.random() * 8) + 18,
    Iluminación: Math.floor(Math.random() * 6) + 10,
    TV: Math.floor(Math.random() * 4) + 2,
    Lavadora: Math.floor(Math.random() * 5),
  })),

  Semana: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => ({
    label: d,
    Nevera: Math.floor(Math.random() * 20) + 20,
    Iluminación: Math.floor(Math.random() * 12) + 10,
    TV: Math.floor(Math.random() * 8) + 4,
    Lavadora: Math.floor(Math.random() * 6),
  })),

  Mes: Array.from({ length: 30 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    Nevera: Math.floor(Math.random() * 10) + 20,
    Iluminación: Math.floor(Math.random() * 10) + 15,
    TV: Math.floor(Math.random() * 5) + 3,
    Lavadora: Math.floor(Math.random() * 5),
  })),

  Año: [
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

const dateLabels = {
  Día: "Últimas 24 horas",
  Semana: "Últimos 7 días",
  Mes: "Abril 01, 2026 - Abril 30, 2026",
  Año: "Enero 2026 - Diciembre 2026",
};

const ConsumptionHistory = () => {
  const [activeFilter, setActiveFilter] = useState("Mes");

  const chartData = mockData[activeFilter];

  const devices = useMemo(() => {
    if (!chartData.length) return [];

    return Object.keys(chartData[0]).filter(
      (key) => key !== "label"
    );
  }, [chartData]);

  const rankingData = useMemo(() => {
    return devices.map((device, index) => {
      const total = chartData.reduce(
        (acc, item) => acc + item[device],
        0
      );

      return {
        nombre: device,
        total,
        color: DEVICE_COLORS[index % DEVICE_COLORS.length],
      };
    });
  }, [chartData, devices]);

  const totalPeriodo = rankingData.reduce(
    (acc, item) => acc + item.total,
    0
  );

  return (
    <div className={styles.page}>
      {/* TOP */}
      <div className={styles.topBar}>
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={
                activeFilter === filter
                  ? styles.active
                  : ""
              }
            >
              {filter}
            </button>
          ))}
        </div>

        <p className={styles.date}>
          {dateLabels[activeFilter]}
        </p>
      </div>

      {/* CHART */}
       <Card
        style={{
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <div className={styles.chartBlock}>
          <p className={styles.title}>
            DISTRIBUCIÓN DE CONSUMO POR DISPOSITIVO
          </p>

          <ResponsiveContainer width="100%" height={430}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={colors.border}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Legend iconType="circle" />

              {devices.map((device, index) => (
                <Bar
                  key={device}
                  dataKey={device}
                  fill={
                    DEVICE_COLORS[
                      index % DEVICE_COLORS.length
                    ]
                  }
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* BOTTOM */}
      <div className={styles.bottom}>
        {/* RANKING */}
        <Card
          style={{
            maxWidth: "100%",
            width: "100%",
            padding: "20px",
          }}
        >
          <div className={styles.ranking}>
            <p className={styles.title}>
              RANKING DE CONSUMO
            </p>

            <div className={styles.header}>
              <span>#</span>
              <span>DISPOSITIVO</span>
              <span>TOTAL(kWh)</span>
              <span>% DEL TOTAL</span>
            </div>

            {rankingData.map((item, index) => {
              const pct = (
                (item.total / totalPeriodo) *
                100
              ).toFixed(1);

              return (
                <div
                  key={item.nombre}
                  className={styles.row}
                >
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
        </Card>

        {/* STATS */}
        <div className={styles.stats}>
          <Card>
            <div className={styles.stat}>
              <p>CONSUMO TOTAL PERIODO</p>

              <h3>
                {totalPeriodo.toFixed(1)} kWh
              </h3>

              <span>
                ↑ 10% vs periodo anterior
              </span>
            </div>
          </Card>

          <Card>
            <div className={styles.stat}>
              <p>PROMEDIO</p>

              <h3>
                {(
                  totalPeriodo / chartData.length
                ).toFixed(1)}{" "}
                kWh
              </h3>

              <span>
                Promedio del periodo
              </span>
            </div>
          </Card>

          <Card>
            <div className={styles.stat}>
              <p>MAYOR CONSUMIDOR</p>

              <h3>{rankingData[0]?.nombre}</h3>

              <span>
                {rankingData[0]?.total.toFixed(1)}{" "}
                kWh
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionHistory;