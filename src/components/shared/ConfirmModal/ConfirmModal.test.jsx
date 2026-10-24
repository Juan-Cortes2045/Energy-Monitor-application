import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "./ConfirmModal";

const Harness = ({ onConfirm = () => {} }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        abrir
      </button>
      {open && (
        <ConfirmModal
          title="¿Eliminar?"
          message="No se puede deshacer"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          onConfirm={onConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
};

describe("ConfirmModal", () => {
  it("abre con el foco en el diálogo y lo devuelve al cerrar con Escape", () => {
    render(<Harness />);
    const opener = screen.getByText("abrir");
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "¿Eliminar?" });
    expect(dialog).toHaveAccessibleDescription("No se puede deshacer");
    // El foco entra en el diálogo (en su primer control).
    expect(dialog).toContainElement(document.activeElement);

    fireEvent.keyDown(document.activeElement, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("Tab desde el último botón vuelve al primero (foco atrapado)", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText("abrir"));
    const confirm = screen.getByRole("button", { name: "Eliminar" });
    confirm.focus();
    fireEvent.keyDown(confirm, { key: "Tab" });
    // El primero es el botón X de cerrar (su nombre es el texto de cancelar).
    expect(screen.getAllByRole("button", { name: "Cancelar" })[0]).toHaveFocus();
  });

  it("Escape no cancela mientras la acción está en curso", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal title="t" message="m" confirmLabel="ok" cancelLabel="no" onCancel={onCancel} disabled />,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.keyDown(screen.getByText("m"), { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
