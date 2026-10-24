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
 */
const HomeContext = createContext(null);

export const HomeProvider = ({ children }) => {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
