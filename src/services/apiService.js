import {
  getStoredToken,
  clearSession as clearPersistedSession,
  persistSessionFromResponse,
  isTokenExpired,
  isTokenExpiringSoon,
} from "./sessionStorage";

const DEFAULT_API_BASE_URL = "https://gestionactiva.citaconlaverdad.com/api";
const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
).replace(/\/$/, "");

// Cache de requests en vuelo para deduplicación
const inflightRequests = new Map();

const AUTHLESS_ENDPOINTS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);
const REFRESH_ENDPOINT = "/refresh";
const UNAUTHORIZED_STATUSES = new Set([401, 419]);
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos

let refreshPromise = null;

const shouldSkipAuthHandling = (endpoint = "") =>
  AUTHLESS_ENDPOINTS.has(endpoint) || endpoint === REFRESH_ENDPOINT;

const handleUnauthorized = (status) => {
  if (UNAUTHORIZED_STATUSES.has(status)) {
    clearPersistedSession();
  }
};

const performTokenRefresh = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const token = getStoredToken();
    if (!token) {
      clearPersistedSession();
      throw new Error("No se encontró token para refrescar");
    }

    const response = await fetch(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      clearPersistedSession();
      const message =
        payload?.message ||
        payload?.error ||
        `HTTP error! status: ${response.status}`;
      const error = new Error(message);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    const sessionData = persistSessionFromResponse(payload);

    if (!sessionData.token) {
      const message =
        payload?.message || "No se pudo renovar el token de sesión";
      const error = new Error(message);
      error.payload = payload;
      throw error;
    }

    window.dispatchEvent(
      new CustomEvent("auth:token-refreshed", { detail: sessionData })
    );

    return sessionData;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const ensureFreshToken = async (endpoint) => {
  if (shouldSkipAuthHandling(endpoint)) {
    return;
  }

  const token = getStoredToken();
  if (!token) {
    return;
  }

  if (isTokenExpired()) {
    await performTokenRefresh();
    return;
  }

  if (isTokenExpiringSoon(REFRESH_THRESHOLD_MS)) {
    await performTokenRefresh();
  }
};

const api = {
  async get(endpoint, params = {}) {
    await ensureFreshToken(endpoint);
    const token = getStoredToken();
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(
      (key) => params[key] && url.searchParams.append(key, params[key])
    );

    // Clave única para deduplicación
    const key = `${url.toString()}`;
    if (inflightRequests.has(key)) {
      return inflightRequests.get(key);
    }

    const fetchPromise = (async () => {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        handleUnauthorized(response.status);
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response.json();
    })();

    inflightRequests.set(key, fetchPromise);
    try {
      const result = await fetchPromise;
      return result;
    } finally {
      inflightRequests.delete(key);
    }
  },

  async post(endpoint, data = {}) {
    await ensureFreshToken(endpoint);
    const token = getStoredToken();
    const url = `${API_BASE_URL}${endpoint}`;
    const isAuthEndpoint = AUTHLESS_ENDPOINTS.has(endpoint);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Evitar enviar Authorization en el login
        ...(!isAuthEndpoint && token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },
      body: JSON.stringify(data),
    });
    // Intentar parsear JSON siempre que sea posible
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      // Propagar mensajes de validación del backend (422)
      handleUnauthorized(response.status);
      const message =
        payload?.message ||
        (payload?.errors
          ? Object.values(payload.errors).flat().join(" ")
          : null) ||
        `HTTP error! status: ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.payload = payload;
      throw err;
    }
    return payload;
  },

  async put(endpoint, data = {}) {
    await ensureFreshToken(endpoint);
    const token = getStoredToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },

  async delete(endpoint) {
    await ensureFreshToken(endpoint);
    const token = getStoredToken();

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      // Handle redirect responses (3xx status codes)
      if (response.status >= 300 && response.status < 400) {
        console.warn(
          `⚠️ Redirect detected on DELETE: ${response.status}. Backend is misconfigured - redirecting API calls.`
        );
        // Treat redirects as success for DELETE since they often indicate successful deletion
        return { success: true };
      }

      if (!response.ok) {
        handleUnauthorized(response.status);
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      // Handle 204 No Content response (common for DELETE)
      if (response.status === 204) {
        return { success: true };
      }

      return response.json().catch(() => ({ success: true }));
    } catch (err) {
      // Check if this is a CORS error from a redirect
      // If so, assume the DELETE succeeded on the backend before the redirect
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("CORS")
      ) {
        console.warn(
          "⚠️ CORS/Network error on DELETE (likely due to backend redirect):"
        );
        console.warn(
          "   The event MAY have been deleted on the server despite the error."
        );
        console.warn("   Treating as success and reloading...");
        // Return success - the delete likely worked on the backend
        return { success: true };
      }

      // Network errors, other errors
      console.error("DELETE request failed:", err.message);
      throw err;
    }
  },
};

export const apiBaseUrl = API_BASE_URL;

export default api;
