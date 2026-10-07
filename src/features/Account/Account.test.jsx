import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "../../services/http/errors";
import Account from "./Account";
import ChangePasswordModal from "./ChangePasswordModal";
import { changePassword, updateProfile } from "../../services/auth/authApi";
import { saveSession } from "../../services/auth/session";

vi.mock("../../services/auth/authApi", () => ({
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  saveSession({
    accessToken: "a",
    refreshToken: "r",
    account: { idUser: "u", email: "a@b.co" },
    profile: { name: "Ada", lastName: "Lovelace" },
  });
});

describe("Account", () => {
  it("edita nombre y apellido y envía solo el correo si cambió", async () => {
    updateProfile.mockResolvedValue({});
    render(<Account />);
    await userEvent.click(screen.getAllByRole("button", { name: "edit" })[0]);
    const name = screen.getByLabelText("name");
    await userEvent.clear(name);
    await userEvent.type(name, "Grace");
    await userEvent.click(screen.getByText("save"));
    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        name: "Grace",
        lastName: "Lovelace",
        newEmail: undefined,
      }),
    );
    expect(await screen.findByText("saved")).toBeInTheDocument();
  });

  it("pide confirmación antes de eliminar la cuenta", async () => {
    render(<Account />);
    await userEvent.click(screen.getByText("deleteAccount"));
    expect(screen.getByText("deleteModal.title")).toBeInTheDocument();
    await userEvent.click(screen.getByText("cancel"));
    expect(screen.queryByText("deleteModal.title")).not.toBeInTheDocument();
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
    expect(await screen.findByText("changePassword.wrong")).toBeInTheDocument();
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
