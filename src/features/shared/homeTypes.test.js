import { describe, it, expect } from "vitest";
import { HOME_TYPES, sortHomeTypes } from "./homeTypes";
import es from "../../i18n/locales/es/createHomeModal.json";
import en from "../../i18n/locales/en/createHomeModal.json";
import pt from "../../i18n/locales/pt/createHomeModal.json";
import fr from "../../i18n/locales/fr/createHomeModal.json";

describe("catálogo de tipos de hogar", () => {
  it("coincide con el seed del backend (id_home_type, name)", () => {
    expect(HOME_TYPES.map(({ id, key }) => [id, key])).toEqual([
      ["hous000001", "house"],
      ["apar000001", "apartment"],
      ["stud000001", "studio"],
      ["coun000001", "country_house"],
      ["cabi000001", "cabin"],
      ["othe000001", "other"],
    ]);
  });

  it.each([
    ["es", es],
    ["en", en],
    ["pt", pt],
    ["fr", fr],
  ])("todos los tipos tienen traducción en %s", (_, locale) => {
    HOME_TYPES.forEach(({ key }) => expect(locale.homeTypes[key]).toBeTruthy());
  });

  it("ordena como el catálogo y deja \"other\" al final", () => {
    // Orden en que llegan de GET /home-types: por clave primaria.
    const fromApi = [
      { idHomeType: "apar000001", name: "apartment" },
      { idHomeType: "cabi000001", name: "cabin" },
      { idHomeType: "coun000001", name: "country_house" },
      { idHomeType: "hous000001", name: "house" },
      { idHomeType: "othe000001", name: "other" },
      { idHomeType: "stud000001", name: "studio" },
      { idHomeType: "x000000001", name: "unknown" },
    ];
    expect(sortHomeTypes(fromApi).map(({ name }) => name)).toEqual([
      "house",
      "apartment",
      "studio",
      "country_house",
      "cabin",
      "unknown",
      "other",
    ]);
  });
});
