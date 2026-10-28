import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import PhotoViewer from "./PhotoViewer";
import { safeImage } from "./safeImage";

const PHOTO = "data:image/png;base64,AAAA";

describe("PhotoViewer", () => {
  it("muestra la foto dentro de la página, en un diálogo", () => {
    render(<PhotoViewer src={PHOTO} alt="Foto de Ada" closeLabel="Cerrar" onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Foto de Ada" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Foto de Ada" })).toHaveAttribute("src", PHOTO);
  });

  it("no usa fetch ni abre otra pestaña", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const openSpy = vi.spyOn(globalThis, "open");
    render(<PhotoViewer src={PHOTO} alt="x" closeLabel="Cerrar" onClose={() => {}} />);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("se cierra con el botón, con Escape y al hacer clic fuera", () => {
    const onClose = vi.fn();
    render(<PhotoViewer src={PHOTO} alt="x" closeLabel="Cerrar" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("dialog").parentElement);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("no muestra nada si la imagen no es un data URL de imagen", () => {
    const { container } = render(
      <PhotoViewer src="javascript:alert(1)" alt="x" closeLabel="Cerrar" onClose={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("safeImage", () => {
  it("acepta data URL de imágenes conocidas y rechaza lo demás", () => {
    expect(safeImage(PHOTO)).toBe(PHOTO);
    expect(safeImage("data:text/html;base64,AAAA")).toBeNull();
    expect(safeImage("https://x/y.png")).toBeNull();
    expect(safeImage(null)).toBeNull();
  });
});
