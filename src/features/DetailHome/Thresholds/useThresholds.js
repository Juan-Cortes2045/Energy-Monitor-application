import { useCallback, useEffect, useState } from "react";
import { getThresholds } from "../../../services/home.service";

// A home's daily_limit/monthly_limit/use_system_default (GET
// /homes/:id/thresholds). Call refetch() after a successful PUT.
export function useThresholds(homeId) {
  const [data, setData] = useState(null);
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
    getThresholds(homeId, { signal: controller.signal })
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
  }, [homeId, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, refetch };
}
