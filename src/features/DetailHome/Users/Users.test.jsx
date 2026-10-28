import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Users from "./Users";
import { useMembers } from "../hooks/useMembers";
import { saveSession } from "../../../services/auth/session";

vi.mock("../hooks/useMembers", () => ({ useMembers: vi.fn() }));
const removeMember = vi.fn();
const transferOwnership = vi.fn();
vi.mock("../../../context/useHomes", () => ({
  useHomes: () => ({ removeMember, transferOwnership }),
}));

const home = { idHome: "h1" };
const base = { loading: false, error: null, reload: vi.fn() };

beforeEach(() => {
  removeMember.mockReset();
  transferOwnership.mockReset();
  localStorage.clear();
  saveSession({
    accessToken: "a",
    refreshToken: "r",
    account: { idUser: "u1", email: "ada@mail.co" },
    profile: { name: "Ada", lastName: "Lovelace" },
  });
});

describe("Users", () => {
  it("muestra al responsable y el mensaje vacío cuando no hay más usuarios", () => {
    useMembers.mockReturnValue({ ...base, members: [{ userId: "u1", role: "OWNER" }] });
    render(<Users home={home} isOwner />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("ada@mail.co")).toBeInTheDocument();
    expect(screen.getByText("members.onlyOwnerTitle")).toBeInTheDocument();
  });

  it("muestra al responsable aunque la lista llegue vacía", () => {
    useMembers.mockReturnValue({ ...base, members: [] });
    render(<Users home={home} isOwner />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("con otros miembros no muestra el mensaje vacío", () => {
    useMembers.mockReturnValue({
      ...base,
      members: [
        { userId: "u1", role: "OWNER" },
        { userId: "u2", role: "MEMBER" },
      ],
    });
    render(<Users home={home} isOwner />);
    expect(screen.queryByText("members.onlyOwnerTitle")).not.toBeInTheDocument();
    expect(screen.getByText("u2")).toBeInTheDocument();
  });
});

describe("Users (datos del backend)", () => {
  it("muestra nombre, apellido y correo de los miembros que trae el backend", () => {
    useMembers.mockReturnValue({
      ...base,
      members: [
        { userId: "u1", role: "OWNER", name: "Ada", lastName: "Lovelace", email: "ada@mail.co" },
        { userId: "u2", role: "MEMBER", name: "Grace", lastName: "Hopper", email: "grace@mail.co" },
      ],
    });
    render(<Users home={home} isOwner={false} />);
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("grace@mail.co")).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
  });
});

describe("Users (eliminar miembro)", () => {
  const withMember = () =>
    useMembers.mockReturnValue({
      ...base,
      members: [
        { userId: "u1", role: "OWNER" },
        { userId: "u2", role: "MEMBER", name: "Grace", lastName: "Hopper" },
      ],
    });

  it("pide confirmación antes de eliminar y permite cancelar", () => {
    withMember();
    render(<Users home={home} isOwner />);
    fireEvent.click(screen.getByLabelText("actions.removeUser"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(removeMember).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("confirmRemove.cancel"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(removeMember).not.toHaveBeenCalled();
  });

  it("elimina al miembro al confirmar y cierra el modal", async () => {
    removeMember.mockResolvedValue(null);
    withMember();
    render(<Users home={home} isOwner />);
    fireEvent.click(screen.getByLabelText("actions.removeUser"));
    fireEvent.click(screen.getByText("confirmRemove.confirm"));

    expect(removeMember).toHaveBeenCalledWith("h1", "u2");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });
});

describe("Users (transferir el hogar)", () => {
  const reload = vi.fn();
  const withMember = () =>
    useMembers.mockReturnValue({
      ...base,
      reload,
      members: [
        { userId: "u1", role: "OWNER" },
        { userId: "u2", role: "MEMBER", name: "Grace", lastName: "Hopper" },
      ],
    });

  beforeEach(() => reload.mockReset());

  it("solo el responsable ve la acción, y nunca sobre sí mismo", () => {
    withMember();
    const { unmount } = render(<Users home={home} isOwner />);
    expect(screen.getAllByLabelText("actions.transferOwnership")).toHaveLength(1);
    unmount();

    render(<Users home={home} isOwner={false} />);
    expect(screen.queryByLabelText("actions.transferOwnership")).not.toBeInTheDocument();
  });

  it("no transfiere hasta marcar la casilla de confirmación, y se puede cancelar", () => {
    withMember();
    render(<Users home={home} isOwner />);
    fireEvent.click(screen.getByLabelText("actions.transferOwnership"));

    const confirm = screen.getByText("confirmTransfer.confirm").closest("button");
    expect(confirm).toBeDisabled();
    fireEvent.click(confirm);
    expect(transferOwnership).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("confirmTransfer.acknowledge"));
    expect(confirm).toBeEnabled();

    fireEvent.click(screen.getByText("confirmTransfer.cancel"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(transferOwnership).not.toHaveBeenCalled();
  });

  it("al confirmar transfiere al miembro, recarga la lista y lo informa", async () => {
    transferOwnership.mockResolvedValue(null);
    withMember();
    render(<Users home={home} isOwner />);
    fireEvent.click(screen.getByLabelText("actions.transferOwnership"));
    fireEvent.click(screen.getByLabelText("confirmTransfer.acknowledge"));
    fireEvent.click(screen.getByText("confirmTransfer.confirm"));

    expect(transferOwnership).toHaveBeenCalledWith("h1", "u2");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(reload).toHaveBeenCalled();
    expect(screen.getByText("confirmTransfer.done")).toBeInTheDocument();
  });

  it.each([
    [403, "errors:ownershipTransfer.notOwner"],
    [404, "errors:ownershipTransfer.notMember"],
    [409, "errors:ownershipTransfer.alreadyOwner"],
  ])("muestra el error del servidor (%i)", async (status, key) => {
    transferOwnership.mockResolvedValue({ status });
    withMember();
    render(<Users home={home} isOwner />);
    fireEvent.click(screen.getByLabelText("actions.transferOwnership"));
    fireEvent.click(screen.getByLabelText("confirmTransfer.acknowledge"));
    fireEvent.click(screen.getByText("confirmTransfer.confirm"));

    expect(await screen.findByRole("alert")).toHaveTextContent(key);
    expect(reload).not.toHaveBeenCalled();
  });

  it("muestra la foto de cada miembro y la amplía sin salir de la página", () => {
    useMembers.mockReturnValue({
      ...base,
      members: [
        { userId: "u1", role: "OWNER" },
        { userId: "u2", role: "MEMBER", name: "Grace", lastName: "Hopper", profileImage: "data:image/png;base64,AAAA" },
        { userId: "u3", role: "MEMBER", name: "Alan", lastName: "Turing" },
      ],
    });
    render(<Users home={home} isOwner />);

    // Quien tiene foto la muestra; quien no, sus iniciales.
    expect(screen.getAllByRole("button", { name: /actions\.viewPhoto/ })).toHaveLength(1);
    expect(screen.getByText("AT")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /actions\.viewPhoto/ }));
    expect(screen.getByRole("dialog", { name: "Grace Hopper" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Grace Hopper" })).not.toBeInTheDocument();
  });

  it("ignora una foto que no es un data URL de imagen", () => {
    useMembers.mockReturnValue({
      ...base,
      members: [
        { userId: "u1", role: "OWNER" },
        { userId: "u2", role: "MEMBER", name: "Eve", lastName: "Mallory", profileImage: "https://evil.example/x.png" },
      ],
    });
    render(<Users home={home} isOwner />);
    expect(screen.queryByRole("button", { name: /actions\.viewPhoto/ })).not.toBeInTheDocument();
    expect(screen.getByText("EM")).toBeInTheDocument();
  });
});
