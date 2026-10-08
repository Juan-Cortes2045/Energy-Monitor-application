import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useHomes } from "./useHomes";
import {
  deleteAlert,
  deleteResolvedAlerts,
  listAlerts,
  markAlertRead,
  toUiAlert,
} from "../services/alerts/alertApi";

/**
 * Bandeja de alertas de todos los hogares del usuario, compartida por la barra lateral
 * (insignia), el aviso emergente y la página de Notificaciones.
 *
 * Se consulta cada 30 s. Una alerta pendiente que no se había visto en este navegador dispara
 * el aviso emergente; las vistas se recuerdan en localStorage para no repetirlo al recargar.
 */
const NotificationCenterContext = createContext(null);

const POLL_MS = 30000;
const SEEN_KEY = "energymonitor.seenAlerts";

/** null la primera vez en este navegador: entonces lo pendiente se da por visto sin aviso. */
function readSeen() {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw == null ? null : new Set(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeSeen(ids) {
  try {
    // Solo hace falta recordar las recientes.
    localStorage.setItem(SEEN_KEY, JSON.stringify([...ids].slice(-300)));
  } catch {
    // almacenamiento no disponible: el aviso puede repetirse, no es grave
  }
}

export const NotificationCenterProvider = ({ children }) => {
  const { homes } = useHomes();
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const seenRef = useRef(null);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    const timer = setInterval(reload, POLL_MS);
    return () => clearInterval(timer);
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    if (homes.length === 0) return undefined;
    Promise.all(
      homes.map((h) => listAlerts(h.idHome).then((list) => list.map((a) => toUiAlert(a, h.name)))),
    )
      .then((lists) => {
        if (cancelled) return;
        const all = lists.flat();
        if (seenRef.current == null) {
          const stored = readSeen();
          if (stored == null) {
            seenRef.current = new Set(all.map((a) => a.id));
            writeSeen(seenRef.current);
          } else {
            seenRef.current = stored;
          }
        }
        const fresh = all.filter((a) => !a.resolved && !seenRef.current.has(a.id));
        fresh.forEach((a) => seenRef.current.add(a.id));
        if (fresh.length) {
          writeSeen(seenRef.current);
          setToasts((prev) => [...prev, ...fresh].slice(-3));
        }
        setAlerts(all);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [homes, attempt]);

  /** Avisos informativos: "marcar como leído". */
  const markRead = useCallback(async (id) => {
    await markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  }, []);

  /** Una alerta resuelta o leída. */
  const remove = useCallback(async (id) => {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  /** Todas las resueltas o leídas, de todos los hogares. */
  const removeAllResolved = useCallback(async () => {
    const homeIds = [...new Set(alerts.filter((a) => a.resolved).map((a) => a.homeId))];
    await Promise.all(homeIds.map((homeId) => deleteResolvedAlerts(homeId)));
    setAlerts((prev) => prev.filter((a) => !a.resolved));
  }, [alerts]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pendingCount = alerts.filter((a) => !a.resolved).length;

  // El contador también en el título de la pestaña: se ve aunque esté en segundo plano.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = pendingCount > 0 ? `(${pendingCount}) ${base}` : base;
  }, [pendingCount]);

  return (
    <NotificationCenterContext.Provider
      value={{
        alerts,
        error,
        reload,
        markRead,
        remove,
        removeAllResolved,
        pendingCount,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </NotificationCenterContext.Provider>
  );
};

export default NotificationCenterContext;
