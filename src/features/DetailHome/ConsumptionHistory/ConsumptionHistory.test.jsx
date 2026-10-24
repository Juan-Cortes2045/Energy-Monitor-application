import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { deviceApi } from "../../../services/devices";
import ConsumptionHistory from "./ComsumptionHistory";

vi.mock("../../../services/devices", () => ({
  deviceApi: { getConsumptionHistory: vi.fn() },
}));
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ currentTheme: { mode: "light" } }),
}));

const devices = [
  { id: "d1", applianceType: "fridge" },
  { id: "d2", applianceType: "tv" },
];

const monthHistory = {
  period: "month",
  previousTotal: 10,
  buckets: [
    { key: "2026-10-01", devices: [{ deviceId: "d1", energy: 3 }, { deviceId: "d2", energy: 1 }] },
    { key: "2026-10-02", devices: [{ deviceId: "d1", energy: 5 }, { deviceId: "d2", energy: 3 }] },
  ],
};

beforeAll(() => {
  // recharts (ResponsiveContainer) necesita ResizeObserver, que jsdom no trae.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  deviceApi.getConsumptionHistory.mockReset();
});

describe("ConsumptionHistory", () => {
  it("muestra 'cargando' en la caja del gráfico mientras llega el periodo", () => {
    deviceApi.getConsumptionHistory.mockReturnValue(new Promise(() => {}));
    render(<ConsumptionHistory homeId="h1" devices={devices} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(deviceApi.getConsumptionHistory).toHaveBeenCalledWith("h1", "month");
  });

  it("los filtros de periodo e intervalo son grupos de botones con aria-pressed", async () => {
    deviceApi.getConsumptionHistory.mockResolvedValue(monthHistory);
    render(<ConsumptionHistory homeId="h1" devices={devices} />);

    const period = screen.getByRole("group", { name: "filters.label" });
    expect(within(period).getByRole("button", { name: "filters.month" })).toHaveAttribute("aria-pressed", "true");
    expect(within(period).getByRole("button", { name: "filters.day" })).toHaveAttribute("aria-pressed", "false");

    const range = screen.getByRole("group", { name: "subfilters.label" });
    const all = within(range).getByRole("button", { name: "subfilters.showAll" });
    const week1 = within(range).getByRole("button", { name: "subfilters.month.sem1" });
    expect(all).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(week1);
    expect(week1).toHaveAttribute("aria-pressed", "true");
    expect(all).toHaveAttribute("aria-pressed", "false");
    // "Todo" sigue en su sitio para volver al periodo completo.
    fireEvent.click(all);
    expect(all).toHaveAttribute("aria-pressed", "true");

    await screen.findByRole("table");
  });

  it("el gráfico va antes que el resumen y el ranking se expone como tabla", async () => {
    deviceApi.getConsumptionHistory.mockResolvedValue(monthHistory);
    render(<ConsumptionHistory homeId="h1" devices={devices} />);

    const table = await screen.findByRole("table", { name: "ranking.title" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3); // encabezado + 2 tipos
    expect(within(rows[1]).getByText("8.00 kWh")).toBeInTheDocument();

    const chartTitle = screen.getByRole("heading", { name: "chart.title.month" });
    const summaryTitle = screen.getByRole("heading", { name: "summary.title" });
    expect(chartTitle.compareDocumentPosition(summaryTitle) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.getByText("12.00 kWh")).toBeInTheDocument();
    // El selector de dispositivo arranca en el mayor consumidor.
    const selector = screen.getByRole("group", { name: "chart.deviceLabel" });
    expect(within(selector).getAllByRole("button")[0]).toHaveAttribute("aria-pressed", "true");
  });
});
