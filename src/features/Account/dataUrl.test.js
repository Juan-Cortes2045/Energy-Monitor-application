import { describe, it, expect } from "vitest";
import { dataUrlToBlob } from "./dataUrl";

describe("dataUrlToBlob", () => {
  it("devuelve los bytes y el tipo de la imagen sin conectarse a nada", async () => {
    // "PNG" en base64 tras la firma: basta para comprobar bytes y tipo.
    const blob = dataUrlToBlob("data:image/png;base64,iVBORw==");

    expect(blob.type).toBe("image/png");
    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("rechaza lo que no es un data-URL en base64", () => {
    expect(() => dataUrlToBlob("https://example.com/a.png")).toThrow();
    expect(() => dataUrlToBlob("data:image/svg+xml,<svg/>")).toThrow();
    expect(() => dataUrlToBlob(null)).toThrow();
  });
});
