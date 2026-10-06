import { useCallback, useEffect, useState } from "react";
import * as api from "../../../services/home";

/** Miembros activos de un hogar (endpoint nuevo del backend). */
export function useMembers(homeId) {
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

  return { members, loading, error, reload };
}
