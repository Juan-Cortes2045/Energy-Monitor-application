/*
 * Service worker de EnergyMonitor: solo recibe notificaciones push.
 *
 * El backend cifra cada mensaje para este navegador (Web Push, RFC 8291) con un JSON
 * { title, body, url, tag }. Llega aunque la pestaña esté cerrada.
 */

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() };
  }
  const title = data.title || "EnergyMonitor";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.tag,
      data: { url: data.url || "/notifications" },
    }),
  );
});

// Al pulsar la notificación se enfoca una pestaña abierta de la app o se abre una nueva.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/notifications", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.location.origin));
      if (open) {
        open.navigate(url);
        return open.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
