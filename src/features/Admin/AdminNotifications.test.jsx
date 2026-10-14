import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminNotifications from "./AdminNotifications";
import { useNotificationCenter } from "../../context/useNotificationCenter";

vi.mock("../../context/useNotificationCenter", () => ({ useNotificationCenter: vi.fn() }));
vi.mock("../../design/components/Header/Header", () => ({ default: () => null }));

const base = {
  error: null,
  reload: vi.fn(),
  markAdminRead: vi.fn(),
  markAllAdminRead: vi.fn(),
  removeAdmin: vi.fn(),
};

const unread = {
  id: "n1", messageKey: "admin.accountRegistered", subjectUserId: "u2",
  subjectName: "Ada Lovelace", subjectEmail: "ada@mail.co", createdAt: "2026-10-14T12:00:00", read: false,
};
const read = { ...unread, id: "n2", messageKey: "admin.statusChanged.BLOCKED", read: true };

beforeEach(() => vi.clearAllMocks());

describe("AdminNotifications", () => {
  it("sin notificaciones muestra el estado vacío", () => {
    useNotificationCenter.mockReturnValue({ ...base, adminNotifications: [] });
    render(<AdminNotifications />);
    expect(screen.getByText("notifications.empty.title")).toBeInTheDocument();
  });

  it("muestra cada evento con su título y permite marcar como leída", async () => {
    base.markAdminRead.mockResolvedValue();
    useNotificationCenter.mockReturnValue({ ...base, adminNotifications: [unread, read] });
    render(<AdminNotifications />);
    // Sin instancia de i18n en los tests, t() devuelve el texto por defecto de cada evento.
    expect(screen.getAllByText(/^notifications\.events\..*\.title$/)).toHaveLength(2);
    expect(screen.getByText("notifications.new")).toBeInTheDocument();
    expect(screen.getByText("notifications.read")).toBeInTheDocument();

    fireEvent.click(screen.getByText("notifications.markRead"));
    await waitFor(() => expect(base.markAdminRead).toHaveBeenCalledWith("n1"));
  });

  it("solo las leídas se pueden eliminar", async () => {
    base.removeAdmin.mockResolvedValue();
    useNotificationCenter.mockReturnValue({ ...base, adminNotifications: [unread, read] });
    render(<AdminNotifications />);
    expect(screen.getAllByText("notifications.delete")).toHaveLength(1);
    fireEvent.click(screen.getByText("notifications.delete"));
    await waitFor(() => expect(base.removeAdmin).toHaveBeenCalledWith("n2"));
  });

  it("marca todas como leídas cuando hay pendientes", async () => {
    base.markAllAdminRead.mockResolvedValue();
    useNotificationCenter.mockReturnValue({ ...base, adminNotifications: [unread] });
    render(<AdminNotifications />);
    fireEvent.click(screen.getByText("notifications.markAllRead"));
    await waitFor(() => expect(base.markAllAdminRead).toHaveBeenCalled());
  });

  it("si una acción falla lo avisa", async () => {
    base.markAdminRead.mockRejectedValue({ status: 500 });
    useNotificationCenter.mockReturnValue({ ...base, adminNotifications: [unread] });
    render(<AdminNotifications />);
    fireEvent.click(screen.getByText("notifications.markRead"));
    expect(await screen.findByRole("alert")).toHaveTextContent("notifications.failed");
  });
});
