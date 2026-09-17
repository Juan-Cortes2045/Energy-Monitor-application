import { useEffect, useState } from "react";
import { listApplianceTypes } from "../../../services/catalog.service";

// The API identifies appliance types by id (e.g. "ATY0000001"); the UI's
// icon map, chart palette and i18n keys (deviceTypes.js APPLIANCE_ICON,
// deviceChartConfig.js) are keyed by the stable name string instead (e.g.
// "fridge"). This fetches the catalog once and exposes id -> name so every
// screen can bridge between the two without re-fetching.
export function useApplianceTypes() {
  const [byId, setById] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Guards against React StrictMode's double effect invocation in dev —
    // see useHomeConsumption.js for why an unguarded .finally() is unsafe.
    let active = true;
    const controller = new AbortController();
    listApplianceTypes({ signal: controller.signal })
      .then((types) => {
        if (active) setById(Object.fromEntries(types.map((t) => [t.id, t.name])));
      })
      .catch(() => {
        if (active) setById({});
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return { byId, loading, nameOf: (id) => byId[id] ?? "other" };
}
