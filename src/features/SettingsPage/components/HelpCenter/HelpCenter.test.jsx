import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HelpCenter from "./HelpCenter";
import { usePermissions } from "../../../../services/auth/usePermissions";

vi.mock("../../../../services/auth/usePermissions", () => ({ usePermissions: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts?.returnObjects ? [] : key),
    i18n: { language: "es" },
  }),
}));
vi.mock("../../../landingPage/components/Support/useSupportContacts", () => ({
  useSupportContacts: () => ({
    contacts: { status: "ready", list: [{ name: "Sofía", email: "sofia@energymonitor.co" }] },
    selectedEmail: "sofia@energymonitor.co",
    setSelectedEmail: vi.fn(),
  }),
  openSupportTicket: vi.fn(),
}));

describe("HelpCenter", () => {
  beforeEach(() => usePermissions.mockReturnValue({ isAdmin: false }));

  it("cada tarjeta abre su modal y se cierra", () => {
    render(<HelpCenter />);
    for (const [action, title] of [
      ["help.docs.action", "title"],
      ["help.support.action", "help.support.title"],
      ["help.updates.action", "title"],
    ]) {
      fireEvent.click(screen.getByRole("button", { name: action }));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAccessibleName(title);
      fireEvent.click(screen.getByRole("button", { name: "help.close" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });

  it("el soporte ofrece crear el ticket para un usuario", () => {
    render(<HelpCenter />);
    fireEvent.click(screen.getByRole("button", { name: "help.support.action" }));
    expect(screen.getByText("help.supportModal.intro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "contact.email.buttonTo" })).toBeInTheDocument();
  });

  it("un administrador no ve el soporte, porque es quien lo atiende", () => {
    usePermissions.mockReturnValue({ isAdmin: true });
    render(<HelpCenter />);
    expect(screen.queryByRole("button", { name: "help.support.action" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "help.docs.action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "help.updates.action" })).toBeInTheDocument();
  });
});
