import { describe, it, expect, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import GuestRoute from "./GuestRoute";
import { saveSession } from "../services/auth/session";

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<p>login</p>} />
          <Route path="/register" element={<p>register</p>} />
        </Route>
        <Route path="/dashboard" element={<p>dashboard</p>} />
        <Route path="/admin/users" element={<p>admin</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("GuestRoute", () => {
  beforeEach(() => localStorage.clear());

  it("sin sesión muestra el login", () => {
    renderAt("/login");
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("con sesión, iniciar sesión lleva directo al panel de hogares", () => {
    saveSession({ account: { idUser: "u1" }, permissions: [] });
    renderAt("/login");
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("con sesión de administrador lleva a la administración", () => {
    saveSession({ account: { idUser: "a1" }, permissions: ["USER.READ"] });
    renderAt("/login");
    expect(screen.getByText("admin")).toBeInTheDocument();
  });

  it("con sesión, el registro también lleva al panel", () => {
    saveSession({ account: { idUser: "u1" }, permissions: [] });
    renderAt("/register");
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("la sesión que se abre en la propia pantalla no la saca de ahí", () => {
    renderAt("/login");
    act(() => saveSession({ account: { idUser: "u1" }, permissions: [] }));
    expect(screen.getByText("login")).toBeInTheDocument();
  });
});
