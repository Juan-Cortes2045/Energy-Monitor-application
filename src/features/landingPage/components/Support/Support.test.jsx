import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Support from "./Support";
import { getSupportContacts } from "../../../../services/support";

vi.mock("../../../../services/support", () => ({ getSupportContacts: vi.fn() }));

const ANDRES = { name: "Andrés Gil", email: "andres@energymonitor.co" };
const SOFIA = { name: "Sofía Ríos", email: "sofia@energymonitor.co" };

describe("contacto de soporte", () => {
  let open;
  beforeEach(() => {
    vi.clearAllMocks();
    open = vi.fn();
    vi.stubGlobal("open", open);
  });
  afterEach(() => vi.unstubAllGlobals());

  const openedTo = () => new URL(open.mock.calls[0][0]).searchParams.get("to");

  it("ya no ofrece WhatsApp", async () => {
    getSupportContacts.mockResolvedValue([ANDRES]);
    render(<Support />);
    await screen.findByRole("button", { name: "contact.email.buttonTo" });
    expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
  });

  it("con un administrador escribe directamente a su correo", async () => {
    getSupportContacts.mockResolvedValue([ANDRES]);
    render(<Support />);

    await userEvent.click(await screen.findByRole("button", { name: "contact.email.buttonTo" }));

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(openedTo()).toBe(ANDRES.email);
    expect(open.mock.calls[0][2]).toBe("noopener,noreferrer");
  });

  it("con varios administradores deja elegir a quién escribir", async () => {
    getSupportContacts.mockResolvedValue([ANDRES, SOFIA]);
    render(<Support />);

    const choice = await screen.findByLabelText("contact.email.chooseLabel");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Andrés Gil (andres@energymonitor.co)",
      "Sofía Ríos (sofia@energymonitor.co)",
    ]);
    await userEvent.selectOptions(choice, SOFIA.email);
    await userEvent.click(screen.getByRole("button", { name: "contact.email.button" }));

    expect(openedTo()).toBe(SOFIA.email);
  });

  it("sin administradores lo dice y no ofrece el botón", async () => {
    getSupportContacts.mockResolvedValue([]);
    render(<Support />);

    expect(await screen.findByText("contact.email.unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /contact\.email\.button/ })).not.toBeInTheDocument();
  });

  it("si no se pueden cargar los contactos lo dice", async () => {
    getSupportContacts.mockRejectedValue(new Error("red"));
    render(<Support />);

    expect(await screen.findByText("contact.email.unavailable")).toBeInTheDocument();
  });
});
