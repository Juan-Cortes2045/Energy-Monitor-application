import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserOnlyRoute from "./UserOnlyRoute";
import { landingPath, saveSession } from "../services/auth/session";

const session = (extra) => {
  localStorage.clear();
  saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" }, ...extra });
};

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<UserOnlyRoute />}>
          <Route path="/dashboard" element={<p>dashboard</p>} />
          <Route path="/favorites" element={<p>favorites</p>} />
        </Route>
        <Route path="/admin/users" element={<p>admin</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("UserOnlyRoute", () => {
  it("deja pasar a un usuario normal", () => {
    session({ permissions: [] });
    renderAt("/favorites");
    expect(screen.getByText("favorites")).toBeInTheDocument();
  });

  it("lleva a la administración a una cuenta de administrador", () => {
    session({ permissions: ["USER.READ"] });
    renderAt("/dashboard");
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("no decide nada mientras los permisos no han llegado (muestra la carga)", () => {
    session({});
    renderAt("/dashboard");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("admin")).not.toBeInTheDocument();
  });
});

describe("landingPath", () => {
  it("lleva al administrador a la administración y al resto al inicio", () => {
    session({ permissions: ["USER.READ"] });
    expect(landingPath()).toBe("/admin/users");
    session({ permissions: [] });
    expect(landingPath()).toBe("/dashboard");
    session({});
    expect(landingPath()).toBe("/dashboard");
  });
});
