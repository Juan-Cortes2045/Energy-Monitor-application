import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../../../services/devices", () => ({
  connectModule: vi.fn(),
  deviceApi: { listApplianceTypes: vi.fn(() => Promise.resolve([])) },
  isBluetoothSupported: () => true,
  needsLinuxBluetoothFlag: () => false,
  signalPercent: () => 80,
}));

import LinkDeviceModal from "./LinkDeviceModal";

describe("LinkDeviceModal (accesibilidad)", () => {
  const onClose = vi.fn();
  beforeEach(() => onClose.mockReset());

  it("es un diálogo con nombre, recibe el foco y Escape lo cierra", async () => {
    render(<LinkDeviceModal homeId="h1" onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: "title" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // El foco entra en el diálogo (en su primer control).
    expect(dialog).toContainElement(document.activeElement);
    // El progreso de pasos se anuncia como texto, no solo con puntos de color.
    expect(screen.getByRole("img", { name: "stepProgress" })).toBeInTheDocument();
    // Espera a que termine la carga del catálogo para no actualizar el estado fuera de act().
    await screen.findByRole("button", { name: "discover.search" });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("al cerrarse devuelve el foco al botón que lo abrió", async () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();

    const { unmount } = render(<LinkDeviceModal homeId="h1" onClose={onClose} />);
    await screen.findByRole("button", { name: "discover.search" });
    unmount();

    expect(opener).toHaveFocus();
    opener.remove();
  });
});
