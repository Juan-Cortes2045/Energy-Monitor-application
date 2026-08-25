import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTransition } from "react";

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

import Card from "../../../design/components/Card/Card";
import Header from "../../../design/components/Header/Header";
import Users from "../Users/Users";
import HomeDetail from "../Home/Home";
import Devices from "../Devices/Devices";
import Thresholds from "../Thresholds/Thresholds";
import ConsumptionHistory from "../ConsumptionHistory/ComsumptionHistory";
import styles from "./Consumption.module.css";

import colors from "../../../design/tokens/colors";
import typography from "../../../design/tokens/typography";
import radius from "../../../design/tokens/radius";
import { useTranslation } from "react-i18next";

const mockConsumptionData = {
  potencia: 2.4,               // kW
  nivelPotencia: "Medio",
  consumoHoy: 18.5,            // kWh
  limiteConsumo: 30,           // kWh (límite diario configurado)
  dispositivos: {
    activos: 5,
    total: 8,
  },
  limitesDiario: {
    usado: 18.5,
    limite: 30,
  },
  limiteMensual: {
    usado: 320,
    limite: 500,
  },
  consumoHoras: [
    { hora: "00:00", kw: 0.8 }, { hora: "01:00", kw: 0.6 },
    { hora: "02:00", kw: 0.5 }, { hora: "03:00", kw: 0.4 },
    { hora: "04:00", kw: 0.3 }, { hora: "05:00", kw: 0.4 },
    { hora: "06:00", kw: 1.0 }, { hora: "07:00", kw: 1.8 },
    { hora: "08:00", kw: 2.4 }, { hora: "09:00", kw: 2.1 },
    { hora: "10:00", kw: 1.9 }, { hora: "11:00", kw: 2.0 },
    { hora: "12:00", kw: 2.3 }, { hora: "13:00", kw: 2.5 },
    { hora: "14:00", kw: 2.2 }, { hora: "15:00", kw: 2.0 },
    { hora: "16:00", kw: 1.7 }, { hora: "17:00", kw: 2.1 },
    { hora: "18:00", kw: 2.8 }, { hora: "19:00", kw: 3.0 },
    { hora: "20:00", kw: 2.7 }, { hora: "21:00", kw: 2.3 },
    { hora: "22:00", kw: 1.5 }, { hora: "23:00", kw: 0.9 },
  ],
  distribucion: [
    { nombre: "Nevera", porcentaje: 30, consumo: 5.55 },
    { nombre: "Aire acondicionado", porcentaje: 25, consumo: 4.63 },
    { nombre: "Televisor", porcentaje: 15, consumo: 2.78 },
    { nombre: "Lavadora", porcentaje: 12, consumo: 2.22 },
    { nombre: "Iluminación", porcentaje: 10, consumo: 1.85 },
    { nombre: "Otros", porcentaje: 8, consumo: 1.48 },
  ],
};

const TABS = [
  {
    id: "Consumo",
    label: "Consumo",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    id: "Historial",
    label: "Historial",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "Usuarios",
    label: "Usuarios",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "Dispositivos",
    label: "Dispositivos",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "Hogar",
    label: "Hogar",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <polyline points="9 21 9 12 15 12 15 21" />
      </svg>
    ),
  },
];

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-warning)",
  "var(--color-secondary)",
  "var(--color-danger)",
  "#9B59B6",
  "#E67E22",
];

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

const EmptyChart = ({ mensaje = "Sin datos disponibles" }) => (
  <div className={styles.emptyChart}>
    <span className={styles.emptyChartIcon}>📡</span>
    <p className={styles.emptyChartMsg}>{mensaje}</p>
    <span className={styles.emptyChartSub}>
      Se mostrará cuando el back-end esté conectado
    </span>
  </div>
);

const Consumption = () => {
  const { t } = useTranslation("consumption");
  const location = useLocation();
  const navigate = useNavigate();
  const { home, isOwner = false } = location.state ?? {};
  const onBack = () => navigate(-1);
  const [activeTab, setActiveTab] = useState("Consumo");

  const data = mockConsumptionData;

  const LimitBar = ({ label, usado, limite }) => {
    const sinDatos = !limite;
    const pct = sinDatos
      ? 0
      : Math.min(Math.round((usado / limite) * 100), 100);
    return (
      <div className={styles.limitCard}>
        <div className={styles.limitTop}>
          <span className={styles.limitLabel}>{label}</span>
          <span className={styles.limitPct}>{sinDatos ? "—" : `${pct}%`}</span>
        </div>
        <div className={styles.limitBarOuter}>
          <div className={styles.limitBarInner} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.limitValues}>
          {sinDatos ? t("kpi.noData") : `${usado} / ${limite} kWh`}
        </div>
      </div>
    );
  };

  const TABS = [
    {
      id: "Consumo",
      label: t("tabs.consumption"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      id: "Historial",
      label: t("tabs.history"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "Usuarios",
      label: t("tabs.users"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "Dispositivos",
      label: t("tabs.devices"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: "Umbrales",
      label: t("tabs.thresholds"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="21" y1="4" x2="14" y2="4" />
          <line x1="10" y1="4" x2="3" y2="4" />
          <line x1="21" y1="12" x2="12" y2="12" />
          <line x1="8" y1="12" x2="3" y2="12" />
          <line x1="21" y1="20" x2="16" y2="20" />
          <line x1="12" y1="20" x2="3" y2="20" />
          <line x1="14" y1="2" x2="14" y2="6" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="16" y1="18" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      id: "Hogar",
      label: t("tabs.home"),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      ),
    },
  ];

  const breadcrumbItems = [
    { label: t("breadcrumb.home"), onClick: onBack },
    { label: home?.name ?? t("breadcrumb.homeFallback") },
  ];

  return (
    <div>
      <Header breadcrumbItems={breadcrumbItems} />

      <div className={styles.page}>
        {/* TABS */}
        <div className={styles.tabsRow}>
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <span className={styles.tabIcon}>{icon}</span>
              <span className={styles.tabLabel}>{label}</span>
            </button>
          ))}
        </div>

        {/* TAB: Usuarios */}
        {activeTab === "Usuarios" && (
          <Users home={home} isOwner={isOwner} />
        )}

        {/* TAB: Consumo */}
        {activeTab === "Consumo" && (
          <>
            <div className={styles.kpiRow}>
              <div className={`${styles.kpiCard} ${styles.kpiYellow}`}>
                <div className={styles.kpiContent}>
                  <p className={styles.kpiLabel}>{t("kpi.currentPower")}</p>
                  <p className={styles.kpiValue}>
                    {data.potencia ?? "—"}
                    <span className={styles.kpiUnit}>
                      {data.potencia != null ? " kW" : ""}
                    </span>
                  </p>
                  <p className={styles.kpiSub}>
                    {t("kpi.level")} {data.nivelPotencia}
                  </p>
                </div>
              </div>
              <div className={`${styles.kpiCard} ${styles.kpiBlue}`}>
                <div className={styles.kpiContent}>
                  <p className={styles.kpiLabel}>{t("kpi.todayConsumption")}</p>
                  <p className={styles.kpiValue}>
                    {data.consumoHoy ?? "—"}
                    <span className={styles.kpiUnit}>
                      {data.consumoHoy != null ? " kWh" : ""}
                    </span>
                  </p>
                  <p className={styles.kpiSub}>
                    {data.limiteConsumo != null
                      ? `t("kpi.currentLimit") ${data.limiteConsumo} kWh`
                      : t("kpi.noLimit")}
                  </p>
                </div>
              </div>
              <div className={`${styles.kpiCard} ${styles.kpiGreen}`}>
                <div className={styles.kpiContent}>
                  <p className={styles.kpiLabel}>{t("kpi.devices")}</p>
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
                      ? t("kpi.allOperational")
                      : t("kpi.noData")}
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <div className={styles.chartSection}>
                <p className={styles.chartTitle}>
                  {t("charts.globalConsumption")}{" "}
                  <span>{t("charts.last24h")}</span>
                </p>
                <p className={styles.chartSubtitle}>
                  {t("charts.activePower")}
                </p>
                {data.consumoHoras.length === 0 ? (
                  <EmptyChart mensaje={t("charts.historyUnavailable")} />
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart
                      data={data.consumoHoras}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradConsumo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="hora"
                        tick={{ fontSize: 10, fill: "var(--color-text-secondary)", fontFamily: "var(--font-primary)" }}
                        axisLine={false}
                        tickLine={false}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--color-text-secondary)", fontFamily: "var(--font-primary)" }}
                        axisLine={false}
                        tickLine={false}
                        unit=" kW"
                      />
                      <Tooltip content={<CustomAreaTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="kw"
                        stroke="var(--color-primary)"
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

            <div className={styles.bottomRow}>
              <Card>
                <div className={styles.distribucionBlock}>
                  <p className={styles.sectionTitle}>
                    {t("charts.currentDistribution")}
                  </p>
                  {data.distribucion.length === 0 ? (
                    <EmptyChart mensaje={t("charts.distributionUnavailable")} />
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
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(v) => (
                            <span className={styles.legendLabel}>{v}</span>
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
                    {t("charts.deviceConsumption")}
                  </p>
                  {data.distribucion.length === 0 ? (
                    <EmptyChart
                      mensaje={t("charts.deviceConsumptionUnavailable")}
                    />
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
                          stroke="var(--color-border)"
                        />
                        <XAxis
                          type="number"
                          unit=" kW"
                          tick={{ fontSize: 10, fill: "var(--color-text-secondary)", fontFamily: "var(--font-primary)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="nombre"
                          width={85}
                          tick={{ fontSize: 11, fill: "var(--color-text-primary)", fontFamily: "var(--font-primary)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          formatter={(v) => [
                            `${v} kW`,
                            t("tooltip.consumption"),
                          ]}
                          contentStyle={{
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-border)",
                            fontSize: 12,
                            fontFamily: "var(--font-primary)",
                          }}
                        />
                        <Bar dataKey="consumo" radius={[0, 4, 4, 0]} maxBarSize={14}>
                          {data.distribucion.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>

            <div className={styles.limitsRow}>
              <LimitBar
                label={t("limits.daily")}
                usado={data.limitesDiario.usado}
                limite={data.limitesDiario.limite}
              />
              <LimitBar
                label={t("limits.monthly")}
                usado={data.limiteMensual.usado}
                limite={data.limiteMensual.limite}
              />
            </div>
          </>
        )}

        {activeTab === "Historial" && <ConsumptionHistory />}
        {activeTab === "Dispositivos" && (
          <Devices home={home} isOwner={isOwner} />
        )}
        {activeTab === "Umbrales" && (
          <Thresholds home={home} isOwner={isOwner} />
        )}
        {activeTab === "Hogar" && (
          <HomeDetail
            home={home}
            isOwner={isOwner}
            onLeave={() => navigate("/dashboard")}
            onDelete={() => navigate("/dashboard")}
          />
        )}
      </div>
    </div>
  );
};

export default Consumption;