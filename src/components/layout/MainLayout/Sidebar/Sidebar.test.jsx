import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";
import { saveSession } from "../../../../services/auth/session";

vi.mock("../../../../context/useNotificationCenter", () => ({
  useNotificationCenter: () => ({ pendingCount: 0 }),
}));
vi.mock("../../../../context/useHomes", () => ({ useHomes: () => ({ homes: [] }) }));

const session = (permissions) => {
  localStorage.clear();
  saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" }, permissions });
};

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>,
  );

beforeEach(() => localStorage.clear());

describe("Sidebar", () => {
  it("un usuario normal ve inicio, hogares, favoritos, notificaciones y ajustes", () => {
    session([]);
    renderSidebar();
    for (const label of ["home", "homes", "favorites", "notifications", "settings"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
  });

  it("una cuenta de administrador solo ve administración, notificaciones y ajustes", () => {
    session(["USER.READ", "USER.MANAGE", "ROLE.MANAGE"]);
    renderSidebar();
    for (const label of ["admin", "notifications", "settings"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    for (const label of ["home", "homes", "favorites"]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("los botones de solo icono tienen nombre y el menú de perfil se cierra con Escape", () => {
    session([]);
    renderSidebar();
    const trigger = screen.getByRole("button", { name: "openMenu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "collapse" })).toHaveAttribute("aria-expanded", "true");

    const menuBtn = screen.getByRole("button", { name: "profileMenu" });
    fireEvent.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
    const item = screen.getAllByRole("button", { name: "profile.myAccount" }).at(-1);
    item.focus();
    fireEvent.keyDown(item, { key: "Escape" });
    expect(menuBtn).toHaveAttribute("aria-expanded", "false");
    expect(menuBtn).toHaveFocus();
  });
});
