import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthLayout from "./AuthLayout";

describe("AuthLayout", () => {
  it("ofrece un acceso directo a la página de inicio", () => {
    render(
      <MemoryRouter>
        <AuthLayout>
          <p>formulario</p>
        </AuthLayout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "home" })).toHaveAttribute("href", "/home");
  });
});
