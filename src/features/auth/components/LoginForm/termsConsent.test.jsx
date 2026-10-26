import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiError } from "../../../../services/http/errors";
import LoginForm from "./LoginForm";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import { login, loginWithGoogle } from "../../../../services/auth/authApi";
import { requestGoogleCode } from "../../../../services/auth/googleSignIn";

vi.mock("../../../../services/auth/authApi", () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  resendVerification: vi.fn(),
}));

vi.mock("../../../../services/auth/googleSignIn", async (importOriginal) => ({
  ...(await importOriginal()),
  isGoogleEnabled: () => false,
  requestGoogleCode: vi.fn(),
}));

const termsRequired = () => new ApiError(428, "Accept the terms and conditions to continue.");

const inApp = (element) =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={element} />
        <Route path="*" element={<p>landed</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe("términos y condiciones en el login con contraseña", () => {
  beforeEach(() => vi.clearAllMocks());

  const signIn = async () => {
    inApp(<LoginForm />);
    await userEvent.type(document.getElementById("email"), "ana@example.com");
    await userEvent.type(document.getElementById("password"), "Clave#123");
    await userEvent.click(screen.getByRole("button", { name: "login.submit" }));
  };

  it("con 428 muestra los términos y, al aceptarlos, repite el login aceptándolos", async () => {
    login.mockRejectedValueOnce(termsRequired()).mockResolvedValueOnce({});

    await signIn();
    await userEvent.click(await screen.findByRole("button", { name: "consent.accept" }));

    await waitFor(() =>
      expect(login).toHaveBeenLastCalledWith(expect.objectContaining({ acceptTerms: true })),
    );
    expect(await screen.findByText("landed")).toBeInTheDocument();
  });

  it("si cierra los términos sin aceptarlos no entra y se le explica", async () => {
    login.mockRejectedValueOnce(termsRequired());

    await signIn();
    await userEvent.click(await screen.findByRole("button", { name: "consent.cancel" }));

    expect(await screen.findByText("errors:terms.required")).toBeInTheDocument();
    expect(login).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("landed")).not.toBeInTheDocument();
  });
});

describe("términos y condiciones con Google", () => {
  beforeEach(() => vi.clearAllMocks());

  it("una cuenta nueva pide los términos y vuelve a abrir Google aceptándolos", async () => {
    requestGoogleCode.mockResolvedValueOnce("code-1").mockResolvedValueOnce("code-2");
    loginWithGoogle.mockRejectedValueOnce(termsRequired()).mockResolvedValueOnce({});
    const onError = vi.fn();
    inApp(<GoogleSignInButton label="google" onError={onError} />);

    await userEvent.click(screen.getByRole("button", { name: "google" }));
    await userEvent.click(await screen.findByRole("button", { name: "consent.accept" }));

    await waitFor(() => expect(loginWithGoogle).toHaveBeenLastCalledWith("code-2", true));
    expect(loginWithGoogle).toHaveBeenNthCalledWith(1, "code-1", false);
    expect(await screen.findByText("landed")).toBeInTheDocument();
  });

  it("sin aceptar los términos no crea la cuenta", async () => {
    requestGoogleCode.mockResolvedValueOnce("code-1");
    loginWithGoogle.mockRejectedValueOnce(termsRequired());
    const onError = vi.fn();
    inApp(<GoogleSignInButton label="google" onError={onError} />);

    await userEvent.click(screen.getByRole("button", { name: "google" }));
    await userEvent.click(await screen.findByRole("button", { name: "consent.cancel" }));

    await waitFor(() => expect(onError).toHaveBeenLastCalledWith("errors:terms.required"));
    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("en el registro, con el checkbox marcado, los acepta sin preguntar otra vez", async () => {
    requestGoogleCode.mockResolvedValueOnce("code-1");
    loginWithGoogle.mockResolvedValueOnce({});
    inApp(<GoogleSignInButton label="google" onError={vi.fn()} termsAccepted />);

    await userEvent.click(screen.getByRole("button", { name: "google" }));

    await waitFor(() => expect(loginWithGoogle).toHaveBeenCalledWith("code-1", true));
    expect(screen.queryByRole("button", { name: "consent.accept" })).not.toBeInTheDocument();
  });
});
