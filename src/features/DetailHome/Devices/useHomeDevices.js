import { useCallback, useEffect, useState } from "react";
import { listDevices } from "../../../services/device.service";

// Devices linked to a home, each already carrying its latest status,
// signal_strength and today's consumption from the server — see
// GET /homes/:id/devices in mock/server.js. Call refetch() after
// link/unlink so the list reflects the change immediately.
export function useHomeDevices(homeId) {
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
    listDevices(homeId, { signal: controller.signal })
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
