import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../../../../services/http/errors";
import RvPassword from "./RvPassword";
import VerifyRecoverPassword from "../../pages/VerifyRecoverPassword";
import { forgotPassword, resetPassword } from "../../../../services/auth/authApi";

vi.mock("../../../../services/auth/authApi", () => ({
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
}));

const renderFlow = (start) =>
  render(
    <MemoryRouter initialEntries={[start]}>
      <Routes>
        <Route path="/recover" element={<RvPassword />} />
        <Route path="/verifyRecoverPassword" element={<VerifyRecoverPassword />} />
        <Route path="/login" element={<p>login-page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const verifyEntry = { pathname: "/verifyRecoverPassword", state: { email: "a@b.co" } };

const typeCode = async () => {
  const boxes = screen.getAllByRole("textbox");
  for (const [i, d] of [..."123456"].entries()) await userEvent.type(boxes[i], d);
  await userEvent.click(screen.getByText("confirmCode"));
};

const typePasswords = async () => {
  await userEvent.type(await screen.findByLabelText("newPassword"), "Abcdef1!");
  await userEvent.type(screen.getByLabelText("repeatPassword"), "Abcdef1!");
  await userEvent.click(screen.getByText("resetSubmit"));
};

describe("recuperar contraseña", () => {
  beforeEach(() => vi.clearAllMocks());

  it("con un correo registrado envía el código y pasa a escribirlo", async () => {
    forgotPassword.mockResolvedValue(undefined);
    renderFlow("/recover");
    await userEvent.type(document.getElementById("email"), "a@b.co");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText("codeSent")).toBeInTheDocument();
    expect(forgotPassword).toHaveBeenCalledWith("a@b.co");
  });

  it("con un correo sin cuenta lo dice y no pasa a escribir el código", async () => {
    forgotPassword.mockRejectedValue(new ApiError(404, "x"));
    renderFlow("/recover");
    await userEvent.type(document.getElementById("email"), "nadie@b.co");
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent("errors:passwordRecovery.notRegistered");
    expect(screen.queryByText("codeSent")).not.toBeInTheDocument();
  });

  it("código → nueva contraseña → canjea con correo, código y contraseña → /login", async () => {
    resetPassword.mockResolvedValue({});
    renderFlow(verifyEntry);
    await typeCode();
    expect(resetPassword).not.toHaveBeenCalled(); // el código aún no se envía
    await typePasswords();
    await waitFor(() =>
      expect(resetPassword).toHaveBeenCalledWith({
        email: "a@b.co",
        resetToken: "123456",
        newPassword: "Abcdef1!",
      }),
    );
    expect(await screen.findByText("login-page")).toBeInTheDocument();
  });

  it("código rechazado por el backend: vuelve al paso del código con error", async () => {
    resetPassword.mockRejectedValue(new ApiError(400, "x"));
    renderFlow(verifyEntry);
    await typeCode();
    await typePasswords();
    expect(await screen.findByText("codeRejected")).toBeInTheDocument();
    expect(screen.getByText("confirmCode")).toBeInTheDocument();
  });

  it("maneja 429 con la espera y bloquea el botón", async () => {
    resetPassword.mockRejectedValue(new ApiError(429, "x", 900));
    renderFlow(verifyEntry);
    await typeCode();
    await typePasswords();
    expect(await screen.findByText("rateLimited")).toBeInTheDocument();
    expect(screen.getByText("resendIn").closest("button")).toBeDisabled();
  });
});
