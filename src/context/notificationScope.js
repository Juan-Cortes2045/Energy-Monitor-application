/** Alcance de las acciones en bloque de la bandeja: todos los hogares o uno (su id). */
export const ALL_SCOPE = "all";

/** Si una notificación entra en el alcance. */
export function inScope(item, scope) {
  if (!scope || scope === ALL_SCOPE) return true;
  return item.homeId === scope;
}
