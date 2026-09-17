import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as homeService from "../services/home.service";
import { useAuth } from "./AuthContext";

const HomeContext = createContext(null);

// Server-backed replacement for the old in-memory HomeContext. Every home
// already carries { role, favorite, home_type } from GET /homes — nothing
// here is invented client-side (no more Date.now() ids or fake "joined"
// homes). Call refetch() after creating/joining/leaving a home or toggling
// favorite so every consumer (sidebar, dashboard, favorites) stays in sync.
export const HomeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tracks the most recently started refetch() so a stale call — e.g. the
  // discarded run from React StrictMode's dev-mode double effect-invoke —
  // can't overwrite state after a newer one already resolved.
  const requestIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    if (!isAuthenticated) {
      setHomes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await homeService.listHomes();
      if (requestIdRef.current === requestId) setHomes(data);
    } catch (err) {
      if (requestIdRef.current === requestId) setError(err);
    } finally {
      if (requestIdRef.current === requestId) setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return <HomeContext.Provider value={{ homes, loading, error, refetch }}>{children}</HomeContext.Provider>;
};

export const useHomes = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHomes debe usarse dentro de <HomeProvider>");
  return ctx;
};

export default HomeContext;
