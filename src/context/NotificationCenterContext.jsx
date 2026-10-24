import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { useHomes } from "./useHomes";
import {
  deleteAlert,
  deleteResolvedAlerts,
  listAlerts,
  markAlertRead,
  toUiAlert,
} from "../services/alerts/alertApi";
import {
  deleteReadRecommendations,
  deleteRecommendation,
  listRecommendations,
  markRecommendationRead,
  toUiRecommendation,
} from "../services/recommendations/recommendationApi";
import {
  deleteAdminNotification,
  listAdminNotifications,
  markAdminNotificationRead,
} from "../services/admin/adminApi";
import { usePermissions } from "../services/auth/usePermissions";

/**
 * Bandeja de alertas y recomendaciones de todos los hogares del usuario, compartida por la
 * barra lateral (insignia), el aviso emergente y la página de Notificaciones.
 *
 * Se consulta cada 30 s. Una alerta pendiente o una recomendación sin leer que no se había visto
 * en este navegador dispara el aviso emergente; las vistas se recuerdan en localStorage para no
 * repetirlo al recargar.
 *
 * Una cuenta de administración no tiene hogares: para ella la bandeja son sus notificaciones de
 * administrador (GET /admin/notifications) y el contador cuenta las no leídas.
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
  const { isAdmin } = usePermissions();
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [attempt, setAttempt] = useState(0);
  const seenRef = useRef(null);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  // Con la pestaña en segundo plano no se consulta; al volver a ella se pone al día enseguida.
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) reload();
    }, POLL_MS);
    const onVisible = () => {
      if (!document.hidden) reload();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    if (!isAdmin) return undefined;
    listAdminNotifications()
      .then((list) => {
        if (cancelled) return;
        setAdminNotifications(list);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [isAdmin, attempt]);

  useEffect(() => {
    let cancelled = false;
    if (isAdmin || homes.length === 0) return undefined;
    const alertsOf = (h) => listAlerts(h.idHome).then((list) => list.map((a) => toUiAlert(a, h.name)));
    const recommendationsOf = (h) =>
      listRecommendations(h.idHome).then((list) => list.map((r) => toUiRecommendation(r, h.name)));
    Promise.all([Promise.all(homes.map(alertsOf)), Promise.all(homes.map(recommendationsOf))])
      .then(([alertLists, recommendationLists]) => {
        if (cancelled) return;
        const loadedAlerts = alertLists.flat();
        const loadedRecommendations = recommendationLists.flat();
        const all = [...loadedAlerts, ...loadedRecommendations];
        if (seenRef.current == null) {
          const stored = readSeen();
          if (stored == null) {
            seenRef.current = new Set(all.map((a) => a.id));
            writeSeen(seenRef.current);
          } else {
            seenRef.current = stored;
          }
        }
        const fresh = all.filter((a) => !a.resolved && !a.read && !seenRef.current.has(a.id));
        fresh.forEach((a) => seenRef.current.add(a.id));
        if (fresh.length) {
          writeSeen(seenRef.current);
          setToasts((prev) => [...prev, ...fresh].slice(-3));
        }
        setAlerts(loadedAlerts);
        setRecommendations(loadedRecommendations);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [homes, attempt, isAdmin]);

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

  /** Recomendaciones: "marcar como leída". */
  const markRecommendationAsRead = useCallback(async (id) => {
    await markRecommendationRead(id);
    setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));
  }, []);

  /** Todas las sin leer, de todos los hogares. */
  const markAllRecommendationsRead = useCallback(async () => {
    const unread = recommendations.filter((r) => !r.read);
    await Promise.all(unread.map((r) => markRecommendationRead(r.id)));
    setRecommendations((prev) => prev.map((r) => ({ ...r, read: true })));
  }, [recommendations]);

  /** Una recomendación leída. */
  const removeRecommendation = useCallback(async (id) => {
    await deleteRecommendation(id);
    setRecommendations((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /** Todas las leídas, de todos los hogares. */
  const removeAllReadRecommendations = useCallback(async () => {
    const homeIds = [...new Set(recommendations.filter((r) => r.read).map((r) => r.homeId))];
    await Promise.all(homeIds.map((homeId) => deleteReadRecommendations(homeId)));
    setRecommendations((prev) => prev.filter((r) => !r.read));
  }, [recommendations]);

  const markAdminRead = useCallback(async (id) => {
    await markAdminNotificationRead(id);
    setAdminNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const removeAdmin = useCallback(async (id) => {
    await deleteAdminNotification(id);
    setAdminNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllAdminRead = useCallback(async () => {
    const unread = adminNotifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => markAdminNotificationRead(n.id)));
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [adminNotifications]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pendingCount = isAdmin
    ? adminNotifications.filter((n) => !n.read).length
    : alerts.filter((a) => !a.resolved).length + recommendations.filter((r) => !r.read).length;

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
        recommendations,
        markRecommendationRead: markRecommendationAsRead,
        markAllRecommendationsRead,
        removeRecommendation,
        removeAllReadRecommendations,
        adminNotifications,
        markAdminRead,
        markAllAdminRead,
        removeAdmin,
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
