import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RequirePermission from "./RequirePermission";
import { saveSession } from "../services/auth/session";

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={["/admin/users"]}>
      <Routes>
        <Route element={<RequirePermission permission="USER.READ" />}>
          <Route path="/admin/users" element={<p>admin page</p>} />
        </Route>
        <Route path="/dashboard" element={<p>dashboard</p>} />
      </Routes>
    </MemoryRouter>,
  );

const session = (extra) => {
  localStorage.clear();
  saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" }, ...extra });
};

describe("RequirePermission", () => {
  beforeEach(() => localStorage.clear());

  it("muestra la página a quien tiene el permiso", () => {
    session({ permissions: ["USER.READ"] });
    renderAt();
    expect(screen.getByText("admin page")).toBeInTheDocument();
  });

  it("manda al inicio a quien no lo tiene", () => {
    session({ permissions: [] });
    renderAt();
    expect(screen.getByText("dashboard")).toBeInTheDocument();
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
  });

  it("no decide nada mientras los permisos no han llegado (muestra la carga)", () => {
    session({});
    renderAt();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("admin page")).not.toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
});
