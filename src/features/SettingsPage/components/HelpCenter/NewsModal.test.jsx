import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NewsModal from "./NewsModal";
import { groupByDate } from "./groupByDate";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k, o) => (o ? `${k} ${JSON.stringify(o)}` : k), i18n: { language: "es" } }),
}));

const entries = [
  { hash: "a1", date: "2026-10-28", type: "feat", scope: "account", title: "show the photo in a viewer" },
  { hash: "a2", date: "2026-10-28", type: "fix", scope: "", title: "close the list on outside click" },
  { hash: "b1", date: "2026-10-27", type: "perf", scope: "web", title: "split the bundle" },
];

describe("NewsModal", () => {
  it("agrupa por fecha, de la más nueva a la más antigua", () => {
    expect(groupByDate(entries).map((g) => [g.date, g.items.length])).toEqual([
      ["2026-10-28", 2],
      ["2026-10-27", 1],
    ]);
  });

  it("muestra cada novedad con su tipo y la versión en línea", () => {
    render(<NewsModal onClose={() => {}} entries={entries} version="1.4.0" buildDate="2026-10-28" commit="abc1234" />);
    expect(screen.getByText("show the photo in a viewer")).toBeInTheDocument();
    expect(screen.getByText("types.new")).toBeInTheDocument();
    expect(screen.getByText("types.fix")).toBeInTheDocument();
    expect(screen.getByText("types.improvement")).toBeInTheDocument();
    expect(screen.getByText(/1\.4\.0/)).toBeInTheDocument();
    expect(screen.getByText(/abc1234/)).toBeInTheDocument();
  });

  it("sin entradas dice que aún no hay novedades", () => {
    render(<NewsModal onClose={() => {}} entries={[]} version="1.0.0" buildDate="" commit="" />);
    expect(screen.getByRole("status")).toHaveTextContent("empty");
  });
});
