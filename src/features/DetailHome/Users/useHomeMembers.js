import { useCallback, useEffect, useState } from "react";
import { listMembers } from "../../../services/home.service";

// Members of a home (GET /homes/:id/members): { user_id, role, favorite,
// email, name, last_name, profile_image } per row. Call refetch() after
// inviting/removing a member.
export function useHomeMembers(homeId) {
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
    listMembers(homeId, { signal: controller.signal })
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
