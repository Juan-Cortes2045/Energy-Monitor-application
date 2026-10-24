import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDialogA11y } from "./useDialogA11y";

const Dialog = ({ name, onClose, children }) => {
  const ref = useDialogA11y(onClose);
  return (
    <div ref={ref} role="dialog" aria-label={name} tabIndex={-1}>
      <button type="button">{`${name}-first`}</button>
      <button type="button">{`${name}-last`}</button>
      {children}
    </div>
  );
};

describe("useDialogA11y", () => {
  it("mueve el foco dentro y Escape cierra", () => {
    const onClose = vi.fn();
    render(<Dialog name="a" onClose={onClose} />);
    expect(screen.getByText("a-first")).toHaveFocus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("con diálogos anidados Escape solo cierra el de más arriba", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Dialog name="outer" onClose={outer}>
        <Dialog name="inner" onClose={inner} />
      </Dialog>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
  });

  it("Tab desde el último vuelve al primero", () => {
    render(<Dialog name="a" onClose={vi.fn()} />);
    screen.getByText("a-last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(screen.getByText("a-first")).toHaveFocus();
  });
});
