import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const deleteHome = vi.fn();
const leaveHome = vi.fn();
const navigate = vi.fn();
vi.mock("../../../../context/useHomes", () => ({
  useHomes: () => ({ deleteHome, leaveHome }),
}));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }));

import DeleteHome from "./DeleteHome";
import HomeDetail from "../Home";

const home = { idHome: "h1", name: "Casa Neiva", role: "OWNER" };

beforeEach(() => {
  deleteHome.mockReset();
  navigate.mockReset();
});

const openModal = () => fireEvent.click(screen.getByRole("button", { name: /buttons.deleteHome/ }));
const confirmButton = () =>
  screen.getAllByRole("button", { name: /buttons.deleteHome/ }).find((b) => b.closest('[role="dialog"]'));

describe("DeleteHome", () => {
  it("only the owner sees the delete button", () => {
    const { unmount } = render(<HomeDetail home={home} isOwner />);
    expect(screen.getByRole("button", { name: /buttons.deleteHome/ })).toBeInTheDocument();
    unmount();

    render(<HomeDetail home={{ ...home, role: "MEMBER" }} isOwner={false} />);
    expect(screen.queryByRole("button", { name: /buttons.deleteHome/ })).not.toBeInTheDocument();
  });

  it("asks for the home name before deleting", () => {
    render(<DeleteHome home={home} />);
    openModal();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "otra casa" } });
    expect(confirmButton()).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  casa neiva " } });
    expect(confirmButton()).toBeEnabled();
    expect(deleteHome).not.toHaveBeenCalled();
  });

  it("cancelling deletes nothing", () => {
    render(<DeleteHome home={home} />);
    openModal();
    const cancel = screen
      .getAllByRole("button", { name: "confirm.cancel" })
      .find((b) => b.textContent === "confirm.cancel");
    fireEvent.click(cancel);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(deleteHome).not.toHaveBeenCalled();
  });

  it("deletes and goes back to the dashboard once confirmed", async () => {
    deleteHome.mockResolvedValue(null);
    render(<DeleteHome home={home} />);
    openModal();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Casa Neiva" } });
    fireEvent.click(confirmButton());

    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard"));
    expect(deleteHome).toHaveBeenCalledWith("h1");
  });

  it("shows the server refusal and stays on the page", async () => {
    deleteHome.mockResolvedValue({ status: 403 });
    render(<DeleteHome home={home} />);
    openModal();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Casa Neiva" } });
    fireEvent.click(confirmButton());

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
