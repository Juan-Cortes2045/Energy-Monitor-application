// Catálogo de tipos de hogar compartido por el modal de creación y el detalle.
// `id` y `key` son id_home_type y name del seed del backend (home-005-seed-home-type);
// `key` indexa las traducciones (createHomeModal:homeTypes.<key>) y el ícono.
export const HOME_TYPES = [
  { id: "hous000001", key: "house" },
  { id: "apar000001", key: "apartment" },
  { id: "stud000001", key: "studio" },
  { id: "coun000001", key: "country_house" },
  { id: "cabi000001", key: "cabin" },
  { id: "othe000001", key: "other" },
];

/**
 * Ordena la respuesta de GET /home-types como el catálogo, con "other" siempre
 * al final: el backend no garantiza orden. Un tipo desconocido va antes de "other".
 * @param {Array<{idHomeType: string, name: string}>} types
 */
export function sortHomeTypes(types) {
  const rank = ({ name }) => {
    if (name === "other") return Infinity;
    const index = HOME_TYPES.findIndex(({ key }) => key === name);
    return index === -1 ? HOME_TYPES.length : index;
  };
  return [...types].sort((a, b) => rank(a) - rank(b));
}
