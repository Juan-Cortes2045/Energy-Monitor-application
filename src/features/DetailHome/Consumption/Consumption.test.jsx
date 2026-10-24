import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useOutletContext: () => ({ home: { idHome: "h1", name: "Casa" }, isOwner: true }),
}));
vi.mock("../shared/useHomeDevices", () => ({
  useHomeDevices: () => ({
    devices: [],
    summary: null,
    loading: false,
    error: null,
    reload: vi.fn(),
    removeDevice: vi.fn(),
  }),
}));
vi.mock("../../../context/ThemeContext", () => ({ useTheme: () => ({ currentTheme: { mode: "light" } }) }));
vi.mock("../../../design/components/Header/Header", () => ({ default: () => null }));
vi.mock("../Users/Users", () => ({ default: () => <p>users-tab</p> }));
vi.mock("../Home/Home", () => ({ default: () => <p>home-tab</p> }));
vi.mock("../Devices/Devices", () => ({ default: () => <p>devices-tab</p> }));
vi.mock("../Thresholds/Thresholds", () => ({ default: () => <p>thresholds-tab</p> }));
vi.mock("../ConsumptionHistory/ComsumptionHistory", () => ({ default: () => <p>history-tab</p> }));

import Consumption from "./Consumption";

describe("Consumption (pestañas)", () => {
  it("expone las pestañas con roles ARIA y un panel enlazado", () => {
    render(<Consumption />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tabs[0].id);
  });

  it("las flechas cambian de pestaña y mueven el foco", () => {
    render(<Consumption />);
    const tabs = screen.getAllByRole("tab");
    tabs[0].focus();

    fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab")[1]).toHaveFocus();
    expect(screen.getByText("history-tab")).toBeInTheDocument();

    fireEvent.keyDown(screen.getAllByRole("tab")[1], { key: "End" });
    expect(screen.getAllByRole("tab")[5]).toHaveFocus();
    expect(screen.getByText("home-tab")).toBeInTheDocument();

    fireEvent.keyDown(screen.getAllByRole("tab")[5], { key: "ArrowRight" });
    expect(screen.getAllByRole("tab")[0]).toHaveFocus();
  });

  it("los límites se exponen como barras de progreso", () => {
    render(<Consumption />);
    expect(screen.getAllByRole("progressbar")).toHaveLength(2);
  });
});
