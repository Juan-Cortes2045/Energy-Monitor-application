import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

const Boom = () => {
  throw new Error("render roto");
};

describe("ErrorBoundary", () => {
  afterEach(() => vi.restoreAllMocks());

  it("muestra ErrorState en lugar de una pantalla en blanco", () => {
    vi.spyOn(console, "error").mockImplementation(() => {}); // React registra el error
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("render.title");
    expect(screen.getByRole("button", { name: "reload" })).toBeInTheDocument();
  });

  it("se recupera al cambiar resetKey (otra ruta)", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(
      <ErrorBoundary resetKey="/b">
        <p>otra pantalla</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("otra pantalla")).toBeInTheDocument();
  });
});
