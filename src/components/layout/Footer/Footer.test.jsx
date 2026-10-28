import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Footer from "./Footer";

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  );

describe("pie de página público", () => {
  it("lleva a las páginas públicas y a la cuenta", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "explore.howItWorks" })).toHaveAttribute("href", "/home#HowItWorks");
    expect(screen.getByRole("link", { name: "explore.about" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "explore.support" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "account.login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "account.register" })).toHaveAttribute("href", "/register");
  });

  it("abre los documentos legales en el modal y lo cierra", async () => {
    renderFooter();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "legal.privacy" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
