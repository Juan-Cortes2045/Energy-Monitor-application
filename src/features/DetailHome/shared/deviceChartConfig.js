
const DEVICE_CHART_COLORS = {
  light: {
    fridge: "#2563EB",
    washer: "#7C3AED",
    tv: "#DB2777",
    microwave: "#EA580C",
    ac: "#0D9488",
    pc: "#CA8A04",
    waterHeater: "#DC2626",
    lighting: "#65A30D",
    other: "#64748B",
  },
  dark: {
    fridge: "#60A5FA",
    washer: "#A78BFA",
    tv: "#F472B6",
    microwave: "#FB923C",
    ac: "#2DD4BF",
    pc: "#FACC15",
    waterHeater: "#F87171",
    lighting: "#A3E635",
    other: "#94A3B8",
  },
};

export function getDeviceColor(applianceType, mode = "light") {
  const palette = DEVICE_CHART_COLORS[mode] ?? DEVICE_CHART_COLORS.light;
  return palette[applianceType] ?? palette.other;
}
