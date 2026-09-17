import { useCallback, useEffect, useState } from "react";
import {
  getConsumptionDistribution,
  getConsumptionHourly,
  getConsumptionSummary,
} from "../../../services/home.service";

// Powers the Consumption tab's KPIs and charts in one shot: today's summary
// (active_power_w / power_level / daily+monthly usage vs. limit, all from
// GET .../consumption/summary), the hourly active_power_w series for
// `date` (defaults to today), and the appliance-type distribution for
// today. ConsumptionHistory fetches its own range-based series separately,
// since it has its own day/week/month/year selector.
export function useHomeConsumption(homeId, date) {
  const [data, setData] = useState({ summary: null, hourly: [], distribution: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!homeId) return;
    // React StrictMode double-invokes this effect in dev (mount -> cleanup
    // -> mount): without this guard, the discarded first run's aborted
    // request still reaches .finally() and flips loading back to false
    // while `data` is still the initial { summary: null, ... }, crashing
    // the render below (which assumes summary is non-null once !loading).
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      getConsumptionSummary(homeId, { signal: controller.signal }),
      getConsumptionHourly(homeId, date, { signal: controller.signal }),
      getConsumptionDistribution(homeId, { signal: controller.signal }),
    ])
      .then(([summary, hourly, distribution]) => {
        if (active) setData({ summary, hourly, distribution });
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
  }, [homeId, date, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, loading, error, refetch };
}
