import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import i18n from "../../i18n";
import { ApiError } from "../../services/http/errors";
import { deleteAccount, refreshProfile } from "../../services/auth/authApi";
import { saveSession } from "../../services/auth/session";
import Account from "./Account";

// A diferencia de Account.test.jsx, aquí se usan las traducciones reales para
// comprobar el texto que ve el usuario.
vi.mock("../../services/auth/authApi", () => ({
  changePassword: vi.fn(),
  updateProfile: vi.fn(),
  refreshProfile: vi.fn(),
  deleteAccount: vi.fn(),
}));

const SERVER_TEXT =
  "You are the only owner of a home that still has other members. Transfer the ownership or remove the members before deleting your account.";

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

describe("Account: 409 al eliminar la cuenta", () => {
  it("muestra el texto traducido y no el del servidor", async () => {
    refreshProfile.mockResolvedValue();
    saveSession({
      accessToken: "a",
      refreshToken: "r",
      account: { idUser: "u", email: "a@b.co" },
      profile: { name: "Ada", lastName: "Lovelace" },
    });
    deleteAccount.mockRejectedValue(new ApiError(409, SERVER_TEXT));

    render(
      <MemoryRouter>
        <Account />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByText(i18n.t("account:deleteAccount")));
    await userEvent.type(screen.getByLabelText(i18n.t("account:deleteModal.password")), "Secret1!");
    await userEvent.click(screen.getByText(i18n.t("account:deleteModal.confirm")));

    const expected = i18n.t("errors:accountDelete.lastOwner");
    expect(expected).toMatch(/Quita a los miembros/);
    expect(await screen.findByText(expected)).toBeInTheDocument();
    expect(screen.queryByText(SERVER_TEXT)).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/transfer/i);
  });
});
