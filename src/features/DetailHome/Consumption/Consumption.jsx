import { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

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
import { useHomeDevices } from "../shared/useHomeDevices";
import { getDeviceColor } from "../shared/deviceChartConfig";
import EmptyChart from "../shared/EmptyChart";
import ErrorState from "../../../components/shared/ErrorState/ErrorState";
import { useTheme } from "../../../context/ThemeContext";
import styles from "./Consumption.module.css";

import { useTranslation } from "react-i18next";

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

const LimitBar = ({ label, usado, limite, t }) => {
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
        {sinDatos ? t("kpi.noData") : `${Number(usado.toFixed(2))} / ${limite} kWh`}
      </div>
    </div>
  );
};

const Consumption = () => {
  const { t, i18n } = useTranslation("consumption");
  const navigate = useNavigate();
  const { home, isOwner } = useOutletContext();
  const onBack = () => navigate(-1);
  const [activeTab, setActiveTab] = useState("Consumo");
  const { currentTheme } = useTheme();
  const { devices, summary, loading, error, reload, removeDevice } = useHomeDevices(home.idHome);

  const distribucion = useMemo(() => {
    const totals = {};
    devices.forEach((device) => {
      totals[device.applianceType] =
        (totals[device.applianceType] ?? 0) + (device.consumption ?? 0);
    });
    const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);
    // Sin potencia actual (todos desconectados) no hay nada que repartir.
    if (!totalAll) return [];
    return Object.entries(totals).map(([type, consumo]) => ({
      type,
      nombre: t(`applianceTypes.${type}`, { ns: "devices" }),
      consumo: Number(consumo.toFixed(2)),
      porcentaje: totalAll ? Number(((consumo / totalAll) * 100).toFixed(1)) : 0,
    }));

  }, [devices, t, i18n.language]);

  const consumoHoras = useMemo(() => {
    const hours = summary?.lastHours ?? [];
    if (hours.every((h) => h.averagePower == null)) return [];
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    return hours.map((h) => ({
      hora: formatter.format(new Date(h.hourStart)),
      kw: h.averagePower == null ? null : Number((h.averagePower / 1000).toFixed(3)),
    }));
  }, [summary, i18n.language]);

  const activos = devices.filter((d) => d.status === "online").length;
  const data = {
    potencia: summary?.currentPower != null ? Number((summary.currentPower / 1000).toFixed(3)) : null,
    nivelPotencia: summary?.level ?? null,
    consumoHoy: summary?.todayEnergy ?? null,
    limiteConsumo: summary?.dailyLimit ?? null,
    limitesDiario: { usado: summary?.todayEnergy ?? 0, limite: summary?.dailyLimit ?? null },
    limiteMensual: { usado: summary?.monthEnergy ?? 0, limite: summary?.monthlyLimit ?? null },
    consumoHoras,
    dispositivos: { activos, total: devices.length },
    distribucion,
  };

  const devicesSub =
    devices.length === 0
      ? t("kpi.noDevices")
      : activos === devices.length
        ? t("kpi.allOperational")
        : t("kpi.someOffline", { count: devices.length - activos });

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
        {activeTab === "Consumo" && error && <ErrorState error={error} onRetry={reload} />}
        {activeTab === "Consumo" && !error && loading && (
          <p className={styles.chartSubtitle} role="status">{t("loading")}</p>
        )}
        {activeTab === "Consumo" && !error && !loading && (
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
                    {data.nivelPotencia
                      ? `${t("kpi.level")} ${t(`kpi.levels.${data.nivelPotencia}`)}`
                      : t("kpi.noData")}
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
                      ? `${t("kpi.currentLimit")}${data.limiteConsumo} kWh`
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
                  <p className={styles.kpiSub}>{devicesSub}</p>
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
                          {data.distribucion.map((entry) => (
                            <Cell
                              key={entry.type}
                              fill={getDeviceColor(entry.type, currentTheme.mode)}
                            />
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
                          {data.distribucion.map((entry) => (
                            <Cell
                              key={entry.type}
                              fill={getDeviceColor(entry.type, currentTheme.mode)}
                            />
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
                t={t}
                label={
                  summary?.limitPeriod === "MONTHLY"
                    ? `${t("limits.daily")} (${t("limits.calculated")})`
                    : t("limits.daily")
                }
                usado={data.limitesDiario.usado}
                limite={data.limitesDiario.limite}
              />
              <LimitBar
                t={t}
                label={
                  summary?.limitPeriod === "DAILY"
                    ? `${t("limits.monthly")} (${t("limits.calculated")})`
                    : t("limits.monthly")
                }
                usado={data.limiteMensual.usado}
                limite={data.limiteMensual.limite}
              />
            </div>
          </>
        )}

        {activeTab === "Historial" && <ConsumptionHistory homeId={home.idHome} devices={devices} />}
        {activeTab === "Dispositivos" && (
          <Devices
            homeId={home.idHome}
            isOwner={isOwner}
            devices={devices}
            loading={loading}
            error={error}
            onRetry={reload}
            onLinked={() => reload({ quiet: true })}
            onRemoveDevice={removeDevice}
          />
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