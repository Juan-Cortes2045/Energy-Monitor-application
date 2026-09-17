import { useCallback, useEffect, useState } from "react";
import { listAlerts } from "../../services/alert.service";
import { listRecommendations } from "../../services/recommendation.service";

// /notifications is not home-scoped in the route map, so this fetches
// alerts and recommendations across every home the user belongs to (no
// home_id filter — GET /alerts and GET /recommendations already scope the
// result server-side to the caller's own homes).
export function useNotifications() {
  const [data, setData] = useState({ alerts: [], recommendations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Guards against React StrictMode's double effect invocation in dev —
    // see useHomeConsumption.js for why an unguarded .finally() is unsafe.
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      listAlerts(undefined, { signal: controller.signal }),
      listRecommendations(undefined, { signal: controller.signal }),
    ])
      .then(([alerts, recommendations]) => {
        if (active) setData({ alerts, recommendations });
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
  }, [version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  // Alerts now resolve themselves server-side (see mock/lib/alert-resolver.js)
  // instead of via a manual button, so this is the only way the UI finds out
  // a PENDING alert became RESOLVED. refetch is a stable useCallback, so this
  // effect only needs to run once.
  useEffect(() => {
    const id = setInterval(refetch, 60_000);
    return () => clearInterval(id);
  }, [refetch]);

  return { data, loading, error, refetch };
}
