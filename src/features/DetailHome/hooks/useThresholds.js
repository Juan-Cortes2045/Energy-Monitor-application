import { useCallback, useEffect, useState } from "react";
import * as api from "../../../services/home";

/** Umbrales de un hogar. */
export function useThresholds(homeId) {
  const [thresholds, setThresholds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setThresholds(await api.homeApi.getThresholds(homeId));
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

  /** Solo uno de los dos límites: el otro lo deriva el backend (30 días por mes). */
  const save = useCallback(
    async (limitPeriod, limit) => {
      setError(null);
      try {
        const updated = await api.homeApi.updateThresholds(homeId, { limitPeriod, limit });
        setThresholds(updated);
        return null;
      } catch (err) {
        return err;
      }
    },
    [homeId],
  );

  return { thresholds, loading, error, reload, save };
}
