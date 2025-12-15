import api, { apiBaseUrl } from "./apiService";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function getVapidPublicKey() {
  const fromEnv = import.meta.env?.VITE_VAPID_PUBLIC_KEY;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim();
  }

  // Endpoint público del backend
  const payload = await api.get("/push/vapid-public-key");
  const key = payload?.publicKey;
  if (!key) {
    throw new Error("No se pudo obtener la VAPID public key");
  }
  return key;
}

export async function getServiceWorkerRegistration() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("Service Worker no soportado");
  }

  const registration = await navigator.serviceWorker.ready;
  if (!registration) {
    throw new Error("No hay Service Worker listo");
  }

  return registration;
}

export async function subscribeWebPush({ userAgent } = {}) {
  if (typeof window === "undefined") {
    throw new Error("No disponible");
  }

  if (!("Notification" in window)) {
    throw new Error("Notifications API no soportada");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado");
  }

  const registration = await getServiceWorkerRegistration();
  const vapidPublicKey = await getVapidPublicKey();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  const json = subscription.toJSON();

  await api.post("/push/subscribe", {
    endpoint: subscription.endpoint,
    keys: json.keys,
    contentEncoding: "aesgcm",
    userAgent: userAgent || navigator.userAgent,
  });

  return subscription;
}

export async function unsubscribeWebPush() {
  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    return { success: true, message: "No había suscripción" };
  }

  try {
    await api.post("/push/unsubscribe", { endpoint: subscription.endpoint });
  } catch {
    // Si falla el backend, igual intentamos desuscribir en el navegador.
  }

  try {
    await subscription.unsubscribe();
  } catch {
    /* ignore */
  }

  return { success: true };
}

export async function testWebPush() {
  // Endpoint autenticado para validar que el backend puede enviar push.
  // Requiere que el usuario ya esté suscrito (push_subscriptions tenga filas).
  const payload = await api.post("/push/test", {});
  return payload;
}

// helper para llamar sin apiService (si fuera necesario)
export async function fetchVapidPublicKeyRaw() {
  const response = await fetch(`${apiBaseUrl}/push/vapid-public-key`);
  const payload = await response.json();
  return payload?.publicKey;
}
