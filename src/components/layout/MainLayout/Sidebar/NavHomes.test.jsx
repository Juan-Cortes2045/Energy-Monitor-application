import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NavHomes from "./NavHomes";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k) => k }) }));
vi.mock("../../../../context/useHomes", () => ({
  useHomes: () => ({ homes: [{ idHome: "h1", name: "Casa" }] }),
}));

const setup = () =>
  render(
    <MemoryRouter>
      <p>fuera</p>
      <NavHomes icon={null} label="Hogares" collapsed={false} />
    </MemoryRouter>,
  );

describe("NavHomes", () => {
  it("abre la lista y se cierra al hacer clic fuera", () => {
    setup();
    const toggle = screen.getByRole("button", { name: /Hogares/ });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Casa")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText("fuera"));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Casa")).not.toBeInTheDocument();
  });

  it("un clic dentro de la lista no la cierra", () => {
    setup();
    const toggle = screen.getByRole("button", { name: /Hogares/ });
    fireEvent.click(toggle);
    fireEvent.pointerDown(screen.getByText("Casa"));
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("se cierra al elegir un hogar", () => {
    setup();
    const toggle = screen.getByRole("button", { name: /Hogares/ });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByText("Casa"));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});
