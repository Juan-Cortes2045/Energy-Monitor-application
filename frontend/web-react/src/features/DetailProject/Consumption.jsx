import { useParams } from "react-router-dom";
import { useState } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import Card from "../../design/components/Card/Card";
import Sidebar from "../../components/layout/MainLayout/Sidebar/Sidebar";
import Header from "../../design/components/Header/Header";
import styles from "./Consumption.module.css";

import colors from "../../design/tokens/colors";
import typography from "../../design/tokens/typography";
import radius from "../../design/tokens/radius";

const emptyProjectData = {
  name: "",
  potencia: null, // kW   — GET /projects/:id/realtime
  nivelPotencia: "—",
  consumoHoy: null, // kWh  — GET /projects/:id/consumption/today
  limiteConsumo: null, // kWh  — GET /projects/:id/limits
  dispositivos: {
    activos: null,
    total: null,
  },
  limitesDiario: { usado: 0, limite: 0 },
  limiteMensual: { usado: 0, limite: 0 },
  consumoHoras: [], // [{ hora: "00:00", kw: 0.5 }, ...]
  distribucion: [], // [{ nombre: "Nevera", porcentaje: 35, consumo: 0.25 }, ...]
};

const TABS = ["Consumo", "Historial", "Usuarios", "Dispositivos", "Proyecto"];

const CHART_COLORS = [
  colors.primary,
  colors.warning,
  colors.secondary,
  colors.danger,
  "#9B59B6",
  "#E67E22",
];

// ─── Tooltips personalizados ──────────────────────────────────────────────────
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      <p className={styles.tooltipValue}>{payload[0].value} kW</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{payload[0].name}</p>
      <p className={styles.tooltipValue}>{payload[0].value}%</p>
    </div>
  );
};

// ─── Estado vacío ─────────────────────────────────────────────────────────────
const EmptyChart = ({ mensaje = "Sin datos disponibles" }) => (
  <div className={styles.emptyChart}>
    <span className={styles.emptyChartIcon}>📡</span>
    <p className={styles.emptyChartMsg}>{mensaje}</p>
    <span className={styles.emptyChartSub}>
      Se mostrará cuando el back-end esté conectado
    </span>
  </div>
);

// ─── Barra de límite ──────────────────────────────────────────────────────────
const LimitBar = ({ label, usado, limite }) => {
  const sinDatos = !limite;
  const porcentaje = sinDatos
    ? 0
    : Math.min(Math.round((usado / limite) * 100), 100);

  return (
    <div className={styles.limitCard}>
      <div className={styles.limitTop}>
        <span className={styles.limitLabel}>{label}</span>
        <span className={styles.limitPct}>
          {sinDatos ? "—" : `${porcentaje}%`}
        </span>
      </div>
      <div className={styles.limitBarOuter}>
        <div
          className={styles.limitBarInner}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <div className={styles.limitValues}>
        {sinDatos ? "Sin datos" : `${usado} / ${limite} kWh`}
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const Consumption = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Consumo");

  // conectar API
  // useEffect(() => {
  //   fetch(`/api/projects/${id}`).then(r => r.json()).then(setData);
  // }, [id]);
  const data = emptyProjectData;

  const breadcrumbItems = [
    { label: "Inicio " },
    { label: "Proyecto " },
    { label: "Tu proyecto" },
  ];

  return (
    <>
      <div>
        <Header breadcrumbItems={breadcrumbItems}></Header>

        <div className={styles.page}>
          {/* ── TABS ─────────────────────────────────────────────────────────── */}
          <div className={styles.tabsRow}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── KPI CARDS ────────────────────────────────────────────────────── */}
          <div className={styles.kpiRow}>
            <div className={`${styles.kpiCard} ${styles.kpiYellow}`}>
              <div className={styles.kpiContent}>
                <p className={styles.kpiLabel}>POTENCIA ACTUAL ⚡</p>
                <p className={styles.kpiValue}>
                  {data.potencia ?? "—"}
                  <span className={styles.kpiUnit}>
                    {data.potencia != null ? " kW" : ""}
                  </span>
                </p>
                <p className={styles.kpiSub}>Nivel: {data.nivelPotencia}</p>
              </div>
            </div>

            <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
              <div className={styles.kpiContent}>
                <p className={styles.kpiLabel}>CONSUMO HOY 📊</p>
                <p className={styles.kpiValue}>
                  {data.consumoHoy ?? "—"}
                  <span className={styles.kpiUnit}>
                    {data.consumoHoy != null ? " kWh" : ""}
                  </span>
                </p>
                <p className={styles.kpiSub}>
                  {data.limiteConsumo != null
                    ? `Límite actual: ${data.limiteConsumo} kWh`
                    : "Sin límite configurado"}
                </p>
              </div>
            </div>

            <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
              <div className={styles.kpiContent}>
                <p className={styles.kpiLabel}>DISPOSITIVOS 🔌</p>
                <p className={styles.kpiValue}>
                  {data.dispositivos.activos ?? "—"}
                  <span className={styles.kpiUnit}>
                    {data.dispositivos.total != null
                      ? ` / ${data.dispositivos.total}`
                      : ""}
                  </span>
                </p>
                <p className={styles.kpiSub}>
                  {data.dispositivos.activos != null
                    ? "Todos operativos"
                    : "Sin datos"}
                </p>
              </div>
            </div>
          </div>

          {/* ── AREA CHART — Consumo Global 24h ──────────────────────────────── */}
          <Card>
            <div className={styles.chartSection}>
              <p className={styles.chartTitle}>
                Consumo Global — <span>Últimas 24 horas</span>
              </p>
              <p className={styles.chartSubtitle}>Potencia activa en kW</p>

              {data.consumoHoras.length === 0 ? (
                <EmptyChart mensaje="Historial de consumo no disponible" />
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart
                    data={data.consumoHoras}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradConsumo"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={colors.primary}
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor={colors.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={colors.border}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hora"
                      tick={{
                        fontSize: 10,
                        fill: colors.textSecondary,
                        fontFamily: typography.fontPrimary,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval={3}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: colors.textSecondary,
                        fontFamily: typography.fontPrimary,
                      }}
                      axisLine={false}
                      tickLine={false}
                      unit=" kW"
                    />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="kw"
                      stroke={colors.primary}
                      strokeWidth={2}
                      fill="url(#gradConsumo)"
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── PIE + BAR — Distribución y dispositivos ──────────────────────── */}
          <div className={styles.bottomRow}>
            <Card>
              <div className={styles.distribucionBlock}>
                <p className={styles.sectionTitle}>Distribución actual</p>
                {data.distribucion.length === 0 ? (
                  <EmptyChart mensaje="Distribución no disponible" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.distribucion}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="porcentaje"
                        nameKey="nombre"
                      >
                        {data.distribucion.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => (
                          <span
                            style={{
                              fontSize: 11,
                              color: colors.textPrimary,
                              fontFamily: typography.fontPrimary,
                            }}
                          >
                            {v}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card>
              <div className={styles.devicesBlock}>
                <p className={styles.sectionTitle}>
                  Consumo por dispositivo (ahora)
                </p>
                {data.distribucion.length === 0 ? (
                  <EmptyChart mensaje="Consumo por dispositivo no disponible" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      layout="vertical"
                      data={data.distribucion}
                      margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke={colors.border}
                      />
                      <XAxis
                        type="number"
                        unit=" kW"
                        tick={{
                          fontSize: 10,
                          fill: colors.textSecondary,
                          fontFamily: typography.fontPrimary,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={85}
                        tick={{
                          fontSize: 11,
                          fill: colors.textPrimary,
                          fontFamily: typography.fontPrimary,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v) => [`${v} kW`, "Consumo"]}
                        contentStyle={{
                          borderRadius: radius.md,
                          border: `1px solid ${colors.border}`,
                          fontSize: 12,
                          fontFamily: typography.fontPrimary,
                        }}
                      />
                      <Bar
                        dataKey="consumo"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={14}
                      >
                        {data.distribucion.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* ── LÍMITES ───────────────────────────────────────────────────────── */}
          <div className={styles.limitsRow}>
            <LimitBar
              label="Límite diario"
              usado={data.limitesDiario.usado}
              limite={data.limitesDiario.limite}
            />
            <LimitBar
              label="Límite mensual"
              usado={data.limiteMensual.usado}
              limite={data.limiteMensual.limite}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Consumption;
