import { useCallback, useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { getHome } from "../services/home.service";
import GuardScreen from "./GuardScreen";
import RouteLoading from "./RouteLoading";
import ErrorState from "../components/shared/ErrorState/ErrorState";

// Guards /homes/:homeId/*. Always re-verifies against GET /homes/:homeId
// (never trusts the possibly-stale list already in HomeContext) so a
// straight F5 reload on this URL rebuilds the screen correctly, and being
// removed from a home elsewhere shows up immediately. The resolved home
// (with its `role` for this user) is handed down via <Outlet context>, so
// Consumption.jsx and its tabs read it from useOutletContext() instead of
// the old location.state, which broke on reload.
//
// A 404 means the home doesn't exist; a 403 means it exists but the caller
// isn't a member — each gets its own GuardScreen. Anything else (network
// down, 5xx, forced errors) is a genuine fetch failure, not a permission
// verdict, so it gets a retryable ErrorState instead of being folded into
// "forbidden" (that used to mislead the user into thinking they'd lost
// access when the server was simply unreachable).
const HomeMemberRoute = () => {
  const { homeId } = useParams();
  const [state, setState] = useState({ status: "loading", home: null, error: null });
  const [version, setVersion] = useState(0);
  const retry = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", home: null, error: null });
    getHome(homeId)
      .then((home) => {
        if (active) setState({ status: "ready", home, error: null });
      })
      .catch((err) => {
        if (!active) return;
        const status =
          err.status === 404 ? "not-found" : err.status === 403 ? "forbidden" : "error";
        setState({ status, home: null, error: err });
      });
    return () => {
      active = false;
    };
  }, [homeId, version]);

  if (state.status === "loading") return <RouteLoading />;
  if (state.status === "not-found") return <GuardScreen i18nKey="homeNotFound" />;
  if (state.status === "forbidden") return <GuardScreen i18nKey="forbidden" />;
  if (state.status === "error") return <ErrorState error={state.error} onRetry={retry} />;

  return <Outlet context={{ home: state.home, isOwner: state.home.role === "OWNER" }} />;
};

export default HomeMemberRoute;
