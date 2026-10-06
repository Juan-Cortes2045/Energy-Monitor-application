import { useContext } from "react";
import HomeContext from "./HomeContext";

/**
 * Hook de acceso al estado de hogares.
 * En un archivo aparte para que HomeContext.jsx
 * solo exporte el provider (regla de fast refresh).
 */
export function useHomes() {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("useHomes debe usarse dentro de <HomeProvider>");
  return ctx;
}
