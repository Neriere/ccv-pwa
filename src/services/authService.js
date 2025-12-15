import api, { apiBaseUrl } from "./apiService";
import {
  persistSessionFromResponse,
  updateStoredUser,
  getStoredToken,
  getStoredUser,
  clearSession as clearPersistedSession,
  getTokenExpirationIso,
  getSecondsUntilExpiration,
  setLastActivityTimestamp,
  getLastActivityTimestamp,
  isTokenExpired,
} from "./sessionStorage";

/**
 * Servicio de Autenticación
 * Endpoints: POST /api/login, POST /api/logout, GET /api/user, POST /api/refresh
 */

const DEFAULT_ERROR_MESSAGE = "Error al iniciar sesión";

const normalizeLoginPayload = (credentials = {}) => {
  const { email, identifier, password } = credentials;
  if (!password || (!email && !identifier)) {
    throw new Error(
      "Faltan credenciales: email/usuario y contraseña son requeridos"
    );
  }

  return email ? { email, password } : { identifier, password };
};

const ensureSessionStored = (responsePayload) => {
  const { token, user, expiresAt, expiresInSeconds } =
    persistSessionFromResponse(responsePayload);

  if (!token) {
    const message =
      responsePayload?.message ||
      responsePayload?.error ||
      DEFAULT_ERROR_MESSAGE;
    return { success: false, message };
  }

  setLastActivityTimestamp();
  return {
    success: true,
    token,
    user,
    expiresAt,
    expiresInSeconds,
  };
};

// POST /api/login - Iniciar sesión
export const login = async (credentials) => {
  try {
    const payload = normalizeLoginPayload(credentials);
    const response = await api.post("/login", payload);

    if (response?.success === false) {
      return {
        success: false,
        message: response?.message || DEFAULT_ERROR_MESSAGE,
        errors: response?.errors || null,
      };
    }

    return ensureSessionStored(response);
  } catch (error) {
    console.error("Error en login:", error);
    const message =
      error?.message || error?.payload?.message || DEFAULT_ERROR_MESSAGE;
    throw new Error(message);
  }
};

// POST /api/logout - Cerrar sesión
export const logout = async () => {
  try {
    await api.post("/logout", {});
  } catch (error) {
    console.error("Error en logout:", error);
  } finally {
    clearPersistedSession();
  }
};

// POST /api/refresh - Renovar token actual
export const refreshToken = async () => {
  const token = getStoredToken();

  if (!token) {
    throw new Error("No se encontró token para refrescar");
  }

  const url = `${apiBaseUrl}/refresh`;
  const response = await fetch(url, {
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
    const refreshError = new Error(message);
    refreshError.status = response.status;
    refreshError.payload = payload;
    throw refreshError;
  }

  const result = ensureSessionStored(payload);
  if (result?.success && result?.token) {
    window.dispatchEvent(
      new CustomEvent("auth:token-refreshed", { detail: result })
    );
  }
  return result;
};

// GET /api/user - Obtener usuario autenticado actual
export const getCurrentUser = async () => {
  try {
    const data = await api.get("/user");
    updateStoredUser(data);
    return data;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    throw error;
  }
};

// Verificar si hay sesión activa (token presente y no expirado)
export const hasActiveSession = () => {
  const token = getStoredToken();
  if (!token) return false;
  if (isTokenExpired()) return false;
  return true;
};

// Obtener helpers desde el almacenamiento de sesión
export { getStoredUser, getStoredToken };

export const clearSession = () => {
  clearPersistedSession();
};

export const getTokenExpiration = () => getTokenExpirationIso();

export const getTokenSecondsToExpire = () => getSecondsUntilExpiration();

export const markUserActivity = (timestamp) => {
  setLastActivityTimestamp(timestamp);
};

export const getLastRecordedActivity = () => getLastActivityTimestamp();
