import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LegalModal from "./LegalModal";

describe("modal legal", () => {
  it("es un diálogo modal, recibe el foco y Escape lo cierra", async () => {
    const onClose = vi.fn();
    render(<LegalModal isOpen activeTab="terms" onClose={onClose} onTabChange={vi.fn()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toContainElement(document.activeElement);

    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("las pestañas se cambian con las flechas", async () => {
    const onTabChange = vi.fn();
    render(<LegalModal isOpen activeTab="terms" onClose={vi.fn()} onTabChange={onTabChange} />);

    const [terms] = screen.getAllByRole("tab");
    expect(terms).toHaveAttribute("aria-selected", "true");
    terms.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onTabChange).toHaveBeenCalledWith("privacy");
  });

  it("en modo aceptación, aceptar y cancelar avisan a quien lo abrió", async () => {
    const onAccept = vi.fn();
    const onClose = vi.fn();
    render(<LegalModal isOpen activeTab="terms" onClose={onClose} onTabChange={vi.fn()} onAccept={onAccept} />);

    await userEvent.click(screen.getByRole("button", { name: "consent.accept" }));
    await userEvent.click(screen.getByRole("button", { name: "consent.cancel" }));

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("sin onAccept solo muestra los documentos", () => {
    render(<LegalModal isOpen activeTab="terms" onClose={vi.fn()} onTabChange={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "consent.accept" })).not.toBeInTheDocument();
  });
});
