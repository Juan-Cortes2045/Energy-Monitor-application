import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Users from "./Users";
import { useMembers } from "../hooks/useMembers";
import { saveSession } from "../../../services/auth/session";

vi.mock("../hooks/useMembers", () => ({ useMembers: vi.fn() }));
vi.mock("../../../context/useHomes", () => ({
  useHomes: () => ({ removeMember: vi.fn() }),
}));

const home = { idHome: "h1" };
const base = { loading: false, error: null, reload: vi.fn() };

beforeEach(() => {
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
