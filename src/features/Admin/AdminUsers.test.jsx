import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import AdminUsers from "./AdminUsers";
import { saveSession } from "../../services/auth/session";
import * as adminApi from "../../services/admin/adminApi";

vi.mock("../../services/admin/adminApi", async (orig) => ({
  ...(await orig()),
  listUsers: vi.fn(),
  changeUserStatus: vi.fn(),
  grantRole: vi.fn(),
  revokeRole: vi.fn(),
}));
vi.mock("../../design/components/Header/Header", () => ({ default: () => null }));

const me = { idUser: "u1", email: "admin@mail.co", name: "Grace", lastName: "Hopper",
  status: "ACTIVE", roles: ["ADMIN"], registeredAt: "2026-01-01T00:00:00Z", lastLoginAt: null };
const ada = { idUser: "u2", email: "ada@mail.co", name: "Ada", lastName: "Lovelace",
  status: "ACTIVE", roles: [], registeredAt: "2026-01-02T00:00:00Z", lastLoginAt: null };

const session = (permissions) => {
  localStorage.clear();
  saveSession({ accessToken: "a", refreshToken: "r", account: { idUser: "u1" }, permissions });
};

const row = (email) => screen.getByText(email).closest("tr");

beforeEach(() => {
  vi.clearAllMocks();
  adminApi.listUsers.mockResolvedValue({ items: [me, ada], page: 0, size: 20, totalItems: 2 });
  session(["USER.READ", "USER.MANAGE", "ROLE.MANAGE"]);
});

describe("AdminUsers", () => {
  it("lista las cuentas con su estado y sus roles globales", async () => {
    render(<AdminUsers />);
    expect(await screen.findByText("ada@mail.co")).toBeInTheDocument();
    expect(within(row("admin@mail.co")).getByText("ADMIN")).toBeInTheDocument();
    expect(within(row("ada@mail.co")).getByText("table.noRoles")).toBeInTheDocument();
  });

  it("busca por el texto escrito y vuelve a la primera página", async () => {
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    fireEvent.change(screen.getByLabelText("search.label"), { target: { value: "ada" } });
    fireEvent.click(screen.getByText("search.submit"));
    await waitFor(() =>
      expect(adminApi.listUsers).toHaveBeenLastCalledWith({ q: "ada", page: 0, size: 20 }),
    );
  });

  it("al vaciar la búsqueda vuelve el listado completo sin recargar", async () => {
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    const input = screen.getByLabelText("search.label");
    fireEvent.change(input, { target: { value: "ada" } });
    fireEvent.click(screen.getByText("search.submit"));
    await waitFor(() =>
      expect(adminApi.listUsers).toHaveBeenLastCalledWith({ q: "ada", page: 0, size: 20 }),
    );

    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() =>
      expect(adminApi.listUsers).toHaveBeenLastCalledWith({ q: "", page: 0, size: 20 }),
    );
  });

  it("no ofrece acciones sobre la propia cuenta", async () => {
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    const mine = row("admin@mail.co");
    expect(within(mine).queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(mine).queryByRole("button")).not.toBeInTheDocument();
    expect(within(mine).getByText("table.you")).toBeInTheDocument();
  });

  it("solo con USER.READ muestra el directorio sin acciones", async () => {
    session(["USER.READ"]);
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(row("ada@mail.co")).queryByRole("button")).not.toBeInTheDocument();
  });

  it("bloquear una cuenta pide confirmación y recarga la lista", async () => {
    adminApi.changeUserStatus.mockResolvedValue();
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    fireEvent.change(within(row("ada@mail.co")).getByRole("combobox"), {
      target: { value: "BLOCKED" },
    });
    expect(adminApi.changeUserStatus).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("confirm.accept"));
    await waitFor(() => expect(adminApi.changeUserStatus).toHaveBeenCalledWith("u2", "BLOCKED"));
    await waitFor(() => expect(adminApi.listUsers).toHaveBeenCalledTimes(2));
  });

  it("da el rol de administrador sin confirmación y lo quita con confirmación", async () => {
    adminApi.grantRole.mockResolvedValue();
    adminApi.revokeRole.mockResolvedValue();
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    fireEvent.click(within(row("ada@mail.co")).getByRole("button", { name: "actions.grantAdmin" }));
    await waitFor(() => expect(adminApi.grantRole).toHaveBeenCalledWith("u2", "ADMIN"));

    adminApi.listUsers.mockResolvedValue({
      items: [me, { ...ada, roles: ["ADMIN"] }], page: 0, size: 20, totalItems: 2,
    });
    fireEvent.click(await within(row("ada@mail.co")).findByRole("button", { name: "actions.grantAdmin" }));
    await waitFor(() => expect(adminApi.grantRole).toHaveBeenCalledTimes(2));
    fireEvent.click(await within(row("ada@mail.co")).findByRole("button", { name: "actions.revokeAdmin" }));
    fireEvent.click(screen.getByText("confirm.accept"));
    await waitFor(() => expect(adminApi.revokeRole).toHaveBeenCalledWith("u2", "ADMIN"));
  });

  it.each([
    [403, "errors:adminAction.forbidden"],
    [409, "errors:adminAction.self"],
  ])("muestra el error %s del servidor", async (status, key) => {
    adminApi.grantRole.mockRejectedValue({ status });
    render(<AdminUsers />);
    await screen.findByText("ada@mail.co");
    fireEvent.click(within(row("ada@mail.co")).getByRole("button", { name: "actions.grantAdmin" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(key);
  });
});
