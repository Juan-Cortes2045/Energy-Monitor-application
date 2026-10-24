import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../services/auth/authApi", () => ({ refreshProfile: vi.fn() }));

import ProtectedRoute from "./ProtectedRoute";
import { refreshProfile } from "../services/auth/authApi";
import { clearSession, saveSession } from "../services/auth/session";

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<p>privado</p>} />
        </Route>
        <Route path="/login" element={<p>login</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    refreshProfile.mockResolvedValue(undefined);
  });

  it("sin sesión lleva al login sin mostrar el contenido", () => {
    renderAt();
    expect(screen.getByText("login")).toBeInTheDocument();
    expect(screen.queryByText("privado")).not.toBeInTheDocument();
  });

  it("si la sesión se borra (otra pestaña, refresh rechazado) sale al login", () => {
    saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" }, permissions: [] });
    renderAt();
    expect(screen.getByText("privado")).toBeInTheDocument();
    act(() => clearSession());
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("si no llegan los permisos ofrece reintentar en vez de quedarse en blanco", async () => {
    refreshProfile.mockRejectedValueOnce({ status: null });
    saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" } });
    renderAt();
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    act(() => screen.getByRole("button", { name: "retry" }).click());
    expect(refreshProfile).toHaveBeenCalledTimes(2);
  });
});
