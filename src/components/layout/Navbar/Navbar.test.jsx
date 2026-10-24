import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";
import { ThemeProvider } from "../../../context/ThemeContext";

const renderNavbar = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe("Navbar", () => {
  it("es un banner con navegación principal y menú móvil con aria-expanded", () => {
    renderNavbar();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "mainNav" })).toBeInTheDocument();
    const menu = screen.getByRole("button", { name: "openMenu" });
    expect(menu).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(menu);
    expect(screen.getByRole("button", { name: "closeMenu" })).toHaveAttribute("aria-expanded", "true");
  });

  it("Escape cierra el selector de idioma y devuelve el foco a su botón", () => {
    renderNavbar();
    const langBtn = screen.getByRole("button", { name: /changeLanguage/ });
    fireEvent.click(langBtn);
    expect(langBtn).toHaveAttribute("aria-expanded", "true");
    const option = screen.getByRole("button", { name: "English" });
    option.focus();
    fireEvent.keyDown(option, { key: "Escape" });
    expect(screen.queryByRole("button", { name: "English" })).not.toBeInTheDocument();
    expect(langBtn).toHaveFocus();
  });
});
