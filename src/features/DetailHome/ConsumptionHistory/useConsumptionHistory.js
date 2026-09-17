import { useCallback, useEffect, useState } from "react";
import { getConsumptionHistory } from "../../../services/home.service";

// One bucket per label (hour/day/month depending on `range`), one field per
// appliance_type_id present in the home's linked devices, in kWh. See
// GET /homes/:id/consumption/history in mock/server.js.
export function useConsumptionHistory(homeId, range) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!homeId) return;
    // Guards against React StrictMode's double effect invocation in dev —
    // see useHomeConsumption.js for why an unguarded .finally() is unsafe.
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getConsumptionHistory(homeId, range, { signal: controller.signal })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active && err.code !== "ERR_CANCELED") setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [homeId, range, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, refetch };
}
