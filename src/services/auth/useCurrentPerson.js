import { useMemo, useSyncExternalStore } from "react";
import { getCurrentPerson, getSessionSnapshot, subscribeSession } from "./session";

/** Usuario en sesión ({id, name, lastName, email, profileImage}) que se actualiza solo. */
export function useCurrentPerson() {
  const raw = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `raw` es la huella de la sesión
  return useMemo(() => getCurrentPerson(), [raw]);
}
