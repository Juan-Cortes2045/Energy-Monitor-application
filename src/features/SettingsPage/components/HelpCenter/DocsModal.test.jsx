import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DocsModal from "./DocsModal";
import { usePermissions } from "../../../../services/auth/usePermissions";

vi.mock("../../../../services/auth/usePermissions", () => ({ usePermissions: vi.fn() }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts?.returnObjects) {
        return key === "admin"
          ? [{ title: "Roles", body: "b1" }, { title: "Estado", body: "b2" }]
          : [{ title: "Hogares", body: "b3" }];
      }
      return key;
    },
  }),
}));

describe("DocsModal", () => {
  it("un usuario ve solo la documentación de usuario", () => {
    usePermissions.mockReturnValue({ isAdmin: false });
    render(<DocsModal onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Hogares")).toBeInTheDocument();
    expect(screen.queryByText("Roles")).not.toBeInTheDocument();
    expect(screen.getByText("subtitle.user")).toBeInTheDocument();
  });

  it("un administrador ve solo la documentación de administración", () => {
    usePermissions.mockReturnValue({ isAdmin: true });
    render(<DocsModal onClose={() => {}} />);
    expect(screen.getByText("Roles")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.queryByText("Hogares")).not.toBeInTheDocument();
    expect(screen.getByText("subtitle.admin")).toBeInTheDocument();
  });
});
