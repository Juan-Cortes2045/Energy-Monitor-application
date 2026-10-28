import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import i18n from "../../i18n";
import Notifications from "./Notifications";
import { useNotificationCenter } from "../../context/useNotificationCenter";
import { useHomes } from "../../context/useHomes";

vi.mock("../../context/useNotificationCenter", () => ({ useNotificationCenter: vi.fn() }));
vi.mock("../../context/useHomes", () => ({ useHomes: vi.fn() }));
vi.mock("../../services/auth/usePermissions", () => ({ usePermissions: () => ({ isAdmin: false }) }));
vi.mock("../../design/components/Header/Header", () => ({ default: () => null }));

const SCOPE_KEY = "energymonitor.notificationsScope";

const casa = { idHome: "hom0000001", name: "Casa" };
const finca = { idHome: "hom0000002", name: "Finca" };

const activity = (id, key, homeId, home, extra = {}) => ({
  id, kind: "activity", source: homeId ? "HOME" : "ACCOUNT", severity: "info", key, homeId, home,
  date: "2026-10-27T09:00:00Z", read: false, ...extra,
});

const welcome = activity("a1", "activity.account.welcome", null, undefined);
const joinedCasa = activity("a2", "activity.home.member-joined", casa.idHome, "Casa", { actor: "Ana" });
const thresholdsFinca = activity("a3", "activity.home.thresholds-updated", finca.idHome, "Finca", {
  actor: "Luis", read: true,
});
const alertCasa = {
  id: "al1", kind: "alert", type: "threshold", severity: "warning", key: "threshold.high",
  homeId: casa.idHome, home: "Casa", date: "2026-10-26T09:00:00Z", resolved: false,
};

const center = {
  alerts: [alertCasa],
  recommendations: [],
  activity: [welcome, joinedCasa, thresholdsFinca],
  error: null,
  reload: vi.fn(),
  markRead: vi.fn(),
  remove: vi.fn(),
  removeAllResolved: vi.fn(),
  markRecommendationRead: vi.fn(),
  markAllRecommendationsRead: vi.fn(),
  removeRecommendation: vi.fn(),
  removeAllReadRecommendations: vi.fn(),
  markActivityRead: vi.fn(),
  markAllActivityRead: vi.fn(),
  removeActivity: vi.fn(),
  removeAllReadActivity: vi.fn(),
};

beforeAll(() => i18n.changeLanguage("es"));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  useNotificationCenter.mockReturnValue(center);
  useHomes.mockReturnValue({ homes: [casa, finca], error: null, reload: vi.fn() });
});

const filter = () => screen.getByRole("combobox");

describe("Notifications", () => {
  it("muestra la actividad junto a las alertas, con su texto", () => {
    render(<Notifications />);
    expect(screen.getByText("Bienvenido a Energy Monitor")).toBeInTheDocument();
    expect(screen.getByText("Ana se unió a \"Casa\".")).toBeInTheDocument();
    expect(screen.getByText("Luis cambió los umbrales de consumo de \"Finca\".")).toBeInTheDocument();
    expect(screen.getByText("Consumo alto")).toBeInTheDocument();
  });

  it("la pestaña Actividad solo muestra actividad y cuenta las sin leer", () => {
    render(<Notifications />);
    const tab = screen.getByRole("button", { name: /Actividad/ });
    expect(within(tab).getByText("2")).toBeInTheDocument();
    fireEvent.click(tab);
    expect(screen.queryByText("Consumo alto")).not.toBeInTheDocument();
    expect(screen.getByText("Bienvenido a Energy Monitor")).toBeInTheDocument();
  });

  it("el filtro ofrece cada hogar con sus pendientes y la cuenta", () => {
    render(<Notifications />);
    const options = within(filter()).getAllByRole("option").map((o) => o.textContent);
    expect(options).toEqual(["Todos los hogares (3)", "Casa (2)", "Finca", "Cuenta (1)"]);
  });

  it("filtrar por un hogar deja solo lo de ese hogar y se recuerda", () => {
    render(<Notifications />);
    fireEvent.change(filter(), { target: { value: casa.idHome } });
    expect(screen.getByText("Ana se unió a \"Casa\".")).toBeInTheDocument();
    expect(screen.getByText("Consumo alto")).toBeInTheDocument();
    expect(screen.queryByText("Bienvenido a Energy Monitor")).not.toBeInTheDocument();
    expect(screen.queryByText(/Finca/, { selector: "p" })).not.toBeInTheDocument();
    expect(localStorage.getItem(SCOPE_KEY)).toBe(casa.idHome);
  });

  it("la cuenta reúne lo que no es de ningún hogar", () => {
    render(<Notifications />);
    fireEvent.change(filter(), { target: { value: "account" } });
    expect(screen.getByText("Bienvenido a Energy Monitor")).toBeInTheDocument();
    expect(screen.queryByText("Consumo alto")).not.toBeInTheDocument();
  });

  it("un hogar recordado que ya no es del usuario vuelve a todos", () => {
    localStorage.setItem(SCOPE_KEY, "hom0000999");
    render(<Notifications />);
    expect(filter()).toHaveValue("all");
  });

  it("marcar todo como leído actúa sobre el hogar elegido", async () => {
    center.markAllActivityRead.mockResolvedValue();
    render(<Notifications />);
    fireEvent.change(filter(), { target: { value: casa.idHome } });
    fireEvent.click(screen.getByRole("button", { name: /Marcar todas como leídas/ }));
    await waitFor(() => expect(center.markAllActivityRead).toHaveBeenCalledWith(casa.idHome));
    expect(center.markAllRecommendationsRead).not.toHaveBeenCalled();
  });

  it("una actividad sin leer se marca; una leída se elimina", async () => {
    center.markActivityRead.mockResolvedValue();
    center.removeActivity.mockResolvedValue();
    render(<Notifications />);
    fireEvent.click(screen.getByRole("button", { name: /Actividad/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Marcar como leída" })[0]);
    await waitFor(() => expect(center.markActivityRead).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(center.removeActivity).toHaveBeenCalledWith("a3"));
  });

  it("eliminar las leídas incluye la actividad del hogar elegido", async () => {
    center.removeAllReadActivity.mockResolvedValue();
    render(<Notifications />);
    fireEvent.change(filter(), { target: { value: finca.idHome } });
    fireEvent.click(screen.getByRole("button", { name: /Eliminar 1 resuelta o leída/ }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(center.removeAllReadActivity).toHaveBeenCalledWith(finca.idHome));
    expect(center.removeAllResolved).not.toHaveBeenCalled();
  });
});
