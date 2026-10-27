import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../../services/http/errors";
import Account from "./Account";
import ChangePasswordModal from "./ChangePasswordModal";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import {
  changePassword,
  deleteAccount,
  refreshProfile,
  requestAccountDeletionCode,
  updateProfile,
} from "../../services/auth/authApi";
import { saveSession } from "../../services/auth/session";

vi.mock("../../services/auth/authApi", () => ({
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  refreshProfile: vi.fn(),
  deleteAccount: vi.fn(),
  requestAccountDeletionCode: vi.fn(),
}));

const renderAccount = () =>
  render(
    <MemoryRouter initialEntries={["/account"]}>
      <Routes>
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<p>login-page</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  refreshProfile.mockResolvedValue();
  localStorage.clear();
  saveSession({
    accessToken: "a",
    refreshToken: "r",
    account: { idUser: "u", email: "a@b.co" },
    profile: { name: "Ada", lastName: "Lovelace" },
  });
});

describe("Account", () => {
  it("edita nombre y apellido; el correo nunca es editable", async () => {
    updateProfile.mockResolvedValue({});
    renderAccount();
    await userEvent.click(screen.getAllByRole("button", { name: "editField" })[0]);
    const name = screen.getByLabelText("name");
    await userEvent.clear(name);
    await userEvent.type(name, "Grace");
    await userEvent.click(screen.getByText("save"));
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({ name: "Grace", lastName: "Lovelace" }),
    );
    expect(await screen.findByText("saved")).toBeInTheDocument();
    expect(screen.queryByLabelText("email")).not.toBeInTheDocument();
    expect(screen.getByText("a@b.co")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "editField" })).toHaveLength(2);
  });

  it("es un diálogo: Escape y el botón cerrar llaman a onClose", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Account onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("dialog", { name: "title" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "close" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("Escape con el modal de contraseña abierto solo cierra ese modal", async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <Account onClose={onClose} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: "changePassword.title" }));
    expect(screen.getByRole("dialog", { name: "changePassword.title" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "changePassword.title" })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("pide confirmación antes de eliminar la cuenta", async () => {
    renderAccount();
    await userEvent.click(screen.getByText("deleteAccount"));
    expect(screen.getByText("deleteModal.title")).toBeInTheDocument();
    await userEvent.click(screen.getByText("cancel"));
    expect(screen.queryByText("deleteModal.title")).not.toBeInTheDocument();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  it("elimina la cuenta con la contraseña y va a /login", async () => {
    deleteAccount.mockResolvedValue();
    renderAccount();
    await userEvent.click(screen.getByText("deleteAccount"));
    await userEvent.type(screen.getByLabelText("deleteModal.password"), "Secret1!");
    await userEvent.click(screen.getByText("deleteModal.confirm"));
    await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith({ password: "Secret1!" }));
    expect(await screen.findByText("login-page")).toBeInTheDocument();
  });

  it("contraseña incorrecta al eliminar: muestra el error y no sale", async () => {
    deleteAccount.mockRejectedValue(new ApiError(401, "x"));
    renderAccount();
    await userEvent.click(screen.getByText("deleteAccount"));
    await userEvent.type(screen.getByLabelText("deleteModal.password"), "bad");
    await userEvent.click(screen.getByText("deleteModal.confirm"));
    expect(await screen.findByText("errors:accountDelete.wrongPassword")).toBeInTheDocument();
  });
});

describe("Account de una cuenta creada con Google", () => {
  beforeEach(() => {
    saveSession({ account: { idUser: "u", email: "ana@gmail.com", googleAccount: true } });
  });

  it("no ofrece cambiar una contraseña que no tiene", () => {
    renderAccount();

    expect(screen.getByText("passwordGoogle")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "changePassword.title" })).not.toBeInTheDocument();
  });

  it("elimina la cuenta con el código que llega al correo, sin contraseña", async () => {
    requestAccountDeletionCode.mockResolvedValue();
    deleteAccount.mockResolvedValue();
    renderAccount();
    await userEvent.click(screen.getByText("deleteAccount"));
    expect(screen.queryByLabelText("deleteModal.password")).not.toBeInTheDocument();

    await userEvent.click(screen.getByText("deleteModal.sendCode"));
    await userEvent.type(await screen.findByLabelText("deleteModal.code"), "12a3456");
    await userEvent.click(screen.getByText("deleteModal.confirm"));

    await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith({ code: "123456" }));
    expect(await screen.findByText("login-page")).toBeInTheDocument();
  });

  it("mientras el código no se puede enviar lo dice y no deja confirmar", async () => {
    requestAccountDeletionCode.mockRejectedValue(new ApiError(503, "x"));
    renderAccount();
    await userEvent.click(screen.getByText("deleteAccount"));
    await userEvent.click(screen.getByText("deleteModal.sendCode"));

    expect(await screen.findByText("errors:accountDeleteCode.unavailable")).toBeInTheDocument();
    expect(screen.queryByLabelText("deleteModal.code")).not.toBeInTheDocument();
    expect(screen.getByText("deleteModal.confirm").closest("button")).toBeDisabled();
    expect(deleteAccount).not.toHaveBeenCalled();
  });
});

describe("ChangePasswordModal", () => {
  const fill = async (current = "Old1!pass") => {
    await userEvent.type(screen.getByLabelText("changePassword.current"), current);
    await userEvent.type(screen.getByLabelText("changePassword.new"), "Abcdef1!");
    await userEvent.type(screen.getByLabelText("changePassword.repeat"), "Abcdef1!");
    await userEvent.click(screen.getByText("changePassword.submit", { selector: "button span" }));
  };

  it("401 muestra que la contraseña actual es incorrecta", async () => {
    changePassword.mockRejectedValue(new ApiError(401, "x"));
    render(<ChangePasswordModal onClose={vi.fn()} onDone={vi.fn()} />);
    await fill();
    expect(await screen.findByText("errors:passwordChange.wrongCurrent")).toBeInTheDocument();
  });

  it("éxito: manda ambas contraseñas y llama onDone", async () => {
    changePassword.mockResolvedValue({});
    const onDone = vi.fn();
    render(<ChangePasswordModal onClose={vi.fn()} onDone={onDone} />);
    await fill();
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: "Old1!pass",
      newPassword: "Abcdef1!",
    });
  });
});
