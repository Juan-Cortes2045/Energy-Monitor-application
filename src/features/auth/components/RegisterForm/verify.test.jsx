import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../../../../services/home/errors";
import VerifyEmail from "./VerifyEmail";
import { resendVerification, verifyEmail } from "../../services/authApi";

vi.mock("../../services/authApi", () => ({
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
}));

const renderAt = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/VerifyAccount" element={<VerifyEmail />} />
        <Route path="/register" element={<p>register-page</p>} />
        <Route path="/login" element={<p>login-page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const withEmail = { pathname: "/VerifyAccount", state: { email: "a@b.co" } };

const typeCode = async (code) => {
  const inputs = screen.getAllByRole("textbox");
  for (const [i, digit] of [...code].entries()) {
    await userEvent.type(inputs[i], digit);
  }
};

describe("verificar correo", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sin correo en la navegación vuelve al registro", () => {
    renderAt("/VerifyAccount");
    expect(screen.getByText("register-page")).toBeInTheDocument();
  });

  it("envía correo y código, y al verificar va a /login", async () => {
    verifyEmail.mockResolvedValue({});
    renderAt(withEmail);
    await typeCode("123456");
    await userEvent.click(screen.getByText("verify.confirm"));

    await waitFor(() =>
      expect(verifyEmail).toHaveBeenCalledWith({ email: "a@b.co", code: "123456" }),
    );
    expect(await screen.findByText("login-page")).toBeInTheDocument();
  });

  it("un código rechazado (400) muestra el error y no navega", async () => {
    verifyEmail.mockRejectedValue(new ApiError(400, "x"));
    renderAt(withEmail);
    await typeCode("654321");
    await userEvent.click(screen.getByText("verify.confirm"));

    expect(await screen.findByText("verify.codeRejected")).toBeInTheDocument();
    expect(screen.queryByText("login-page")).not.toBeInTheDocument();
  });

  it("reenviar pide un código nuevo para el mismo correo", async () => {
    resendVerification.mockResolvedValue({});
    renderAt(withEmail);
    await userEvent.click(screen.getByText("verify.resend"));

    await waitFor(() => expect(resendVerification).toHaveBeenCalledWith("a@b.co"));
    expect(await screen.findByText("verify.resendSent")).toBeInTheDocument();
  });
});
