import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";
import { clientsClaim } from "workbox-core";

// Take control ASAP to reduce mixed-version issues
self.skipWaiting();
clientsClaim();

// Precache generado por Workbox (injectManifest)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Allow vite-plugin-pwa autoUpdate to activate updated SW.
self.addEventListener("message", (event) => {
  if (event?.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Cache simple de API (similar a lo que había en runtimeCaching)
registerRoute(
  ({ url }) =>
    url.origin === "https://gestionactiva.citaconlaverdad.com" &&
    url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
  })
);

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Notificación",
      body: event.data ? event.data.text() : "",
    };
  }

  const title = payload.title || "Notificación";
  const body = payload.body || "";
  const data = payload.data || {};
  const scope = self.registration?.scope || self.location?.origin || "";
  const toScopedUrl = (maybeUrl) => {
    if (typeof maybeUrl !== "string" || !maybeUrl.trim()) {
      return new URL("./notificaciones", scope).toString();
    }

    // Absolute http(s) URL: keep as-is.
    if (/^https?:\/\//i.test(maybeUrl)) {
      return maybeUrl;
    }

    // Path like "/notificaciones": make it relative to scope.
    if (maybeUrl.startsWith("/")) {
      return new URL(`.${maybeUrl}`, scope).toString();
    }

    // Relative path like "notificaciones": resolve against scope.
    return new URL(maybeUrl, scope).toString();
  };

  const url = toScopedUrl(typeof data.url === "string" ? data.url : "");

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      data: { ...data, url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const scope = self.registration?.scope || self.location?.origin || "";
  const url =
    typeof event.notification?.data?.url === "string"
      ? event.notification.data.url
      : new URL("./notificaciones", scope).toString();

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});
