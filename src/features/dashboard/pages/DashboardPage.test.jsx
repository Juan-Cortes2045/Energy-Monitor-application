import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
}));

vi.mock("../../../context/useHomes", () => ({
  useHomes: vi.fn(),
}));

vi.mock("../../../services/home", () => ({
  homeApi: { listHomeTypes: vi.fn() },
}));

import DashboardPage from "./DashboardPage";
import { useHomes } from "../../../context/useHomes";
import { homeApi } from "../../../services/home";

const home = {
  idHome: "h1",
  name: "Casa",
  address: "Calle 1 # 2-3",
  description: "Casa principal",
  role: "OWNER",
  favorite: true,
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <DashboardPage />
    </MemoryRouter>,
  );

describe("DashboardPage (conexión al backend)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el estado de carga y luego las tarjetas de los hogares", async () => {
    useHomes.mockReturnValue({
      homes: [home],
      loading: true,
      error: null,
      reload: vi.fn(),
      addHome: vi.fn(),
      joinHome: vi.fn(),
      setFavorite: vi.fn(),
    });

    const { rerender } = renderPage();
    expect(screen.getByRole("status")).toHaveTextContent("state.loading");

    useHomes.mockReturnValue({
      homes: [home],
      loading: false,
      error: null,
      reload: vi.fn(),
      addHome: vi.fn(),
      joinHome: vi.fn(),
      setFavorite: vi.fn(),
    });
    rerender(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Casa")).toBeInTheDocument();
  });

  it("muestra el error del servidor con botón de reintentar", async () => {
    useHomes.mockReturnValue({
      homes: [],
      loading: false,
      error: { status: 500, message: "boom" },
      reload: vi.fn(),
      addHome: vi.fn(),
      joinHome: vi.fn(),
      setFavorite: vi.fn(),
    });

    renderPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("state.error");
    expect(screen.getByRole("button", { name: "state.retry" })).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay hogares", async () => {
    useHomes.mockReturnValue({
      homes: [],
      loading: false,
      error: null,
      reload: vi.fn(),
      addHome: vi.fn(),
      joinHome: vi.fn(),
      setFavorite: vi.fn(),
    });

    renderPage();

    // EmptyState usa la namespace emptyState; se renderiza el botón de crear
    expect(await screen.findByRole("button", { name: "createHome" })).toBeInTheDocument();
  });

  it("carga el catálogo de tipos al abrir el modal de creación", async () => {
    useHomes.mockReturnValue({
      homes: [home],
      loading: false,
      error: null,
      reload: vi.fn(),
      addHome: vi.fn(),
      joinHome: vi.fn(),
      setFavorite: vi.fn(),
    });
    homeApi.listHomeTypes.mockResolvedValue([
      { idHomeType: "t1", name: "Casa" },
    ]);

    renderPage();

    // Abre el menú de acciones (+) y elige "crear hogar"
    const trigger = screen.getByRole("button", { name: "Abrir menú de acciones" });
    trigger.click();
    const createOption = await screen.findByRole("button", { name: "actions.createHome" });
    createOption.click();

    await waitFor(() =>
      expect(homeApi.listHomeTypes).toHaveBeenCalledTimes(1),
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
