import { useCallback, useEffect, useState } from "react";
import * as api from "../../../services/home";
import { useHomes } from "../../../context/useHomes";

/**
 * Miembros activos de un hogar (endpoint nuevo del backend).
 *
 * Se vuelven a pedir en cada sincronización de los hogares (`syncCount`), sin "cargando": así
 * quien entra, sale o recibe el hogar aparece sin recargar la página.
 */
export function useMembers(homeId) {
  const { syncCount } = useHomes();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMembers(await api.homeApi.listMembers(homeId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [homeId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos estándar
    reload();
  }, [reload]);

  useEffect(() => {
    if (!syncCount) return undefined;
    let cancelled = false;
    api.homeApi
      .listMembers(homeId)
      .then((list) => !cancelled && setMembers(list))
      // Un fallo en segundo plano deja la lista anterior; la siguiente vuelta lo reintenta.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [homeId, syncCount]);

  return { members, loading, error, reload };
}
