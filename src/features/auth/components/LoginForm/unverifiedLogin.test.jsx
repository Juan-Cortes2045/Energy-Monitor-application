import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ApiError } from "../../../../services/http/errors";
import LoginForm from "./LoginForm";
import VerifyEmail from "../RegisterForm/VerifyEmail";
import { login, resendVerification } from "../../../../services/auth/authApi";

vi.mock("../../../../services/auth/authApi", () => ({
  login: vi.fn(),
  resendVerification: vi.fn(),
  verifyEmail: vi.fn(),
}));

// Muestra adónde llegó la navegación y con qué estado.
const Landed = ({ name }) => {
  const { state } = useLocation();
  return <p>{`${name}:${JSON.stringify(state)}`}</p>;
};

const signIn = async () => {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/VerifyAccount" element={<Landed name="verify" />} />
      </Routes>
    </MemoryRouter>,
  );
  await userEvent.type(document.getElementById("email"), "ana@example.com");
  await userEvent.type(document.getElementById("password"), "Clave#123");
  await userEvent.click(screen.getByRole("button", { name: "login.submit" }));
};

describe("login de una cuenta sin verificar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("pide un código nuevo y lleva a verificar el correo", async () => {
    login.mockRejectedValue(new ApiError(403, "Verify your email address to sign in."));
    resendVerification.mockResolvedValue(undefined);

    await signIn();

    await waitFor(() => expect(resendVerification).toHaveBeenCalledWith("ana@example.com"));
    expect(
      await screen.findByText(
        'verify:{"email":"ana@example.com","reason":"unverified","codeSent":true}',
      ),
    ).toBeInTheDocument();
  });

  it("si el código no se pudo enviar, igual lleva a verificar y lo indica", async () => {
    login.mockRejectedValue(new ApiError(403, "Verify your email address to sign in."));
    resendVerification.mockRejectedValue(new ApiError(429, "too many", 900));

    await signIn();

    expect(
      await screen.findByText(
        'verify:{"email":"ana@example.com","reason":"unverified","codeSent":false}',
      ),
    ).toBeInTheDocument();
  });

  it("una contraseña incorrecta no lleva a verificar", async () => {
    login.mockRejectedValue(new ApiError(401, "Invalid credentials"));

    await signIn();

    await waitFor(() => expect(login).toHaveBeenCalled());
    expect(resendVerification).not.toHaveBeenCalled();
    expect(screen.queryByText(/^verify:/)).not.toBeInTheDocument();
  });
});

describe("pantalla de verificación tras el login", () => {
  const renderVerify = (state) =>
    render(
      <MemoryRouter initialEntries={[{ pathname: "/VerifyAccount", state }]}>
        <Routes>
          <Route path="/VerifyAccount" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>,
    );

  it("explica por qué está aquí y hace esperar el reenvío del código recién enviado", () => {
    renderVerify({ email: "ana@example.com", reason: "unverified", codeSent: true });

    expect(screen.getByRole("status")).toHaveTextContent("verify.unverifiedSent");
    expect(screen.getByRole("button", { name: /verify\.resendIn/ })).toBeDisabled();
  });

  it("si no hubo código, invita a pedirlo", () => {
    renderVerify({ email: "ana@example.com", reason: "unverified", codeSent: false });

    expect(screen.getByRole("status")).toHaveTextContent("verify.unverifiedNotSent");
    expect(screen.getByRole("button", { name: "verify.resend" })).toBeEnabled();
  });
});
