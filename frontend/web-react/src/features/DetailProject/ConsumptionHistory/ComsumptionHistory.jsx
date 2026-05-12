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

const historialData = [
  { dia: "01", nevera: 25, iluminacion: 20, tv: 5 },
  { dia: "02", nevera: 22, iluminacion: 15, tv: 9 },
  { dia: "03", nevera: 30, iluminacion: 18, tv: 4 },
  { dia: "04", nevera: 18, iluminacion: 24, tv: 10 },
  { dia: "05", nevera: 22, iluminacion: 15, tv: 9 },
  { dia: "06", nevera: 18, iluminacion: 24, tv: 10 },
];

const rankingData = [
  {
    nombre: "Nevera",
    total: 534.4,
    porcentaje: 58.4,
    color: colors.primary,
  },
  {
    nombre: "Iluminación",
    total: 196.8,
    porcentaje: 30.4,
    color: colors.warning,
  },
  {
    nombre: "TV",
    total: 40.7,
    porcentaje: 11.2,
    color: colors.secondary,
  },
];

const ConsumptionHistory = () => {
  return (
    <div className={styles.page}>

      {/* TOP */}
      <div className={styles.topBar}>
        <div className={styles.filters}>
          <button className={styles.active}>
            Día
          </button>

          <button>Semana</button>
          <button>Mes</button>
          <button>Año</button>
        </div>

        <p className={styles.date}>
          Abril 01, 2026 - Abril 30, 2026
        </p>
      </div>

      {/* CHART */}
      <Card>
        <div className={styles.chartBlock}>

          <p className={styles.title}>
            DISTRIBUCIÓN DE CONSUMO POR DISPOSITIVO
          </p>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={historialData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={colors.border}
              />

              <XAxis
                dataKey="dia"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip />

              <Legend iconType="circle" />

              <Bar
                dataKey="nevera"
                fill={colors.primary}
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="iluminacion"
                fill={colors.warning}
                radius={[5, 5, 0, 0]}
              />

              <Bar
                dataKey="tv"
                fill={colors.secondary}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

        </div>
      </Card>

      {/* BOTTOM */}
      <div className={styles.bottom}>

        {/* RANKING */}
        <Card>
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

            {rankingData.map((item, index) => (
              <div
                key={item.nombre}
                className={styles.row}
              >
                <span>{index + 1}</span>

                <span>{item.nombre}</span>

                <span>{item.total}</span>

                <div className={styles.percent}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${item.porcentaje}%`,
                      background: item.color,
                    }}
                  />

                  <span>{item.porcentaje}%</span>
                </div>
              </div>
            ))}

          </div>
        </Card>

        {/* STATS */}
        <div className={styles.stats}>

          <Card>
            <div className={styles.stat}>
              <p>CONSUMO TOTAL PERIODO</p>
              <h3>800.5 kWh</h3>
              <span>↑ 10% vs mes anterior</span>
            </div>
          </Card>

          <Card>
            <div className={styles.stat}>
              <p>PROMEDIO DIARIO</p>
              <h3>35.5 kWh</h3>
              <span>Consumidos en 30 días</span>
            </div>
          </Card>

          <Card>
            <div className={styles.stat}>
              <p>MAYOR CONSUMIDOR</p>
              <h3>Nevera</h3>
              <span>234 kWh del total</span>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default ConsumptionHistory;