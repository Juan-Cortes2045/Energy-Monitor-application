import { createContext, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import * as homeApi from "../services/home";
import { getSessionUserId, subscribeSession } from "../services/auth/session";

/**
 * Estado global de hogares, conectado al backend real.
 * Centraliza las llamadas del módulo home para que los
 * componentes no llamen al cliente de API directamente.
 *
 * La lista sigue al usuario en sesión: se carga al iniciar sesión (o al cambiar de cuenta) y se
 * vacía al cerrarla, para que nadie vea los hogares de la cuenta anterior en el mismo navegador.
 *
 * Lo que hacen los demás miembros (expulsarte, salirse, entregarte el hogar, eliminarlo) no llega
 * por ningún canal en vivo: la lista se vuelve a pedir cada SYNC_MS con la pestaña visible y al
 * volver a ella. `syncCount` sube en cada vuelta para que las vistas del hogar (los miembros) se
 * pongan al día a la vez.
 */
const HomeContext = createContext(null);

const SYNC_MS = 15000;

// Misma lista que la anterior: se conserva la referencia para no repintar ni volver a pedir lo
// que depende de `homes` (las notificaciones de cada hogar) cada 15 segundos.
const sameHomes = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncCount, setSyncCount] = useState(0);

  const loadHomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setHomes(await homeApi.homeApi.listHomes());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarga en segundo plano: sin "cargando", que desmontaría la página del hogar, y un fallo deja
   * la lista anterior en pantalla (la siguiente vuelta lo reintenta).
   */
  const syncHomes = useCallback(async () => {
    try {
      const next = await homeApi.homeApi.listHomes();
      setHomes((prev) => (sameHomes(prev, next) ? prev : next));
      setError(null);
    } catch {
      // Red o backend caídos: se sigue mostrando lo último que se supo.
    }
    setSyncCount((n) => n + 1);
  }, []);

  const userId = useSyncExternalStore(subscribeSession, getSessionUserId);

  useEffect(() => {
    if (!userId) {
      // Sin sesión no hay nada que pedir (el backend respondería 401).
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicio al cerrar sesión
      setHomes([]);
      setError(null);
      setLoading(false);
      return;
    }
    loadHomes();
  }, [userId, loadHomes]);

  // Con la pestaña en segundo plano no se consulta; al volver a ella se pone al día enseguida.
  useEffect(() => {
    if (!userId) return undefined;
    const timer = setInterval(() => {
      if (!document.hidden) syncHomes();
    }, SYNC_MS);
    const onVisible = () => {
      if (!document.hidden) syncHomes();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, syncHomes]);

  /** POST /homes — devuelve null o el ApiError */
  const addHome = useCallback(async (payload) => {
    try {
      await homeApi.homeApi.createHome(payload);
      await loadHomes();
      return null;
    } catch (err) {
      return err;
    }
  }, [loadHomes]);

  /** POST /homes/join — devuelve null o el ApiError */
  const joinHome = useCallback(
    async (accessCode) => {
      try {
        await homeApi.homeApi.joinHome({ accessCode });
        await loadHomes();
        return null;
      } catch (err) {
        return err;
      }
    },
    [loadHomes],
  );

  /** PUT /homes/{id}/favorite — alterna favorito en la lista */
  const setFavorite = useCallback(async (homeId) => {
    try {
      const updated = await homeApi.homeApi.toggleFavorite(homeId);
      setHomes((prev) =>
        prev.map((h) =>
          h.idHome === homeId ? { ...h, favorite: updated.favorite } : h,
        ),
      );
      return null;
    } catch (err) {
      return err;
    }
  }, []);

  /** DELETE /homes/{id}/members/me */
  const leaveHome = useCallback(
    async (homeId) => {
      try {
        await homeApi.homeApi.leaveHome(homeId);
        await loadHomes();
        return null;
      } catch (err) {
        return err;
      }
    },
    [loadHomes],
  );

  /** DELETE /homes/{id}: elimina el hogar (solo OWNER) y recarga la lista. */
  const deleteHome = useCallback(
    async (homeId) => {
      try {
        await homeApi.homeApi.deleteHome(homeId);
        await loadHomes();
        return null;
      } catch (err) {
        return err;
      }
    },
    [loadHomes],
  );

  /**
   * PUT /homes/{id}/owner: entrega el hogar a otro miembro y recarga la lista, porque el rol
   * de quien llama pasa a MEMBER. Devuelve null o el ApiError.
   */
  const transferOwnership = useCallback(
    async (homeId, newOwnerId) => {
      try {
        await homeApi.homeApi.transferOwnership(homeId, newOwnerId);
        await loadHomes();
        return null;
      } catch (err) {
        return err;
      }
    },
    [loadHomes],
  );

  /** DELETE /homes/{id}/members/{userId} */
  const removeMember = useCallback(
    async (homeId, userId) => {
      try {
        await homeApi.homeApi.removeMember(homeId, userId);
        return null;
      } catch (err) {
        return err;
      }
    },
    [],
  );

  return (
    <HomeContext.Provider
      value={{
        homes,
        setHomes,
        loading,
        error,
        syncCount,
        reload: loadHomes,
        addHome,
        joinHome,
        setFavorite,
        leaveHome,
        deleteHome,
        removeMember,
        transferOwnership,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export default HomeContext;
