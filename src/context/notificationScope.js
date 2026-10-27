/** Alcance de las acciones en bloque de la bandeja: todos los hogares, uno (su id) o la cuenta. */
export const ALL_SCOPE = "all";
export const ACCOUNT_SCOPE = "account";

/** Si una notificación entra en el alcance: la cuenta reúne las que no son de ningún hogar. */
export function inScope(item, scope) {
  if (!scope || scope === ALL_SCOPE) return true;
  if (scope === ACCOUNT_SCOPE) return item.homeId == null;
  return item.homeId === scope;
}
