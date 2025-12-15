const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const EXPIRES_AT_KEY = "auth_token_expires_at";
const EXPIRES_IN_KEY = "auth_token_expires_in";
const LAST_REFRESH_KEY = "auth_token_last_refreshed";
const LAST_ACTIVITY_KEY = "auth_last_activity";

const toISOStringOrNull = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const persistSession = ({
  token,
  user,
  expiresAt,
  expiresInSeconds,
  lastRefreshedAt = Date.now(),
}) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  const isoExpiration = toISOStringOrNull(expiresAt);
  if (isoExpiration) {
    localStorage.setItem(EXPIRES_AT_KEY, isoExpiration);
  } else {
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  if (typeof expiresInSeconds === "number") {
    localStorage.setItem(EXPIRES_IN_KEY, String(expiresInSeconds));
  } else if (expiresInSeconds === null) {
    localStorage.removeItem(EXPIRES_IN_KEY);
  }

  localStorage.setItem(LAST_REFRESH_KEY, String(lastRefreshedAt));
};

export const persistSessionFromResponse = (payload = {}) => {
  const data =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const token = data?.token ?? null;
  const user = data?.user ?? null;
  const expiresAt = data?.expires_at ?? null;
  const expiresInSeconds =
    typeof data?.expires_in_seconds === "number"
      ? data.expires_in_seconds
      : null;

  persistSession({ token, user, expiresAt, expiresInSeconds });

  return { token, user, expiresAt, expiresInSeconds };
};

export const updateStoredUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("No se pudo parsear auth_user desde localStorage", error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const getTokenExpirationIso = () => localStorage.getItem(EXPIRES_AT_KEY);

export const getTokenExpirationDate = () => {
  const iso = getTokenExpirationIso();
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getSecondsUntilExpiration = () => {
  const expirationDate = getTokenExpirationDate();
  if (!expirationDate) return null;
  return Math.floor((expirationDate.getTime() - Date.now()) / 1000);
};

export const setLastRefreshTimestamp = (timestamp = Date.now()) => {
  localStorage.setItem(LAST_REFRESH_KEY, String(timestamp));
};

export const getLastRefreshTimestamp = () => {
  const raw = localStorage.getItem(LAST_REFRESH_KEY);
  const value = raw ? Number.parseInt(raw, 10) : null;
  return Number.isNaN(value) ? null : value;
};

export const setLastActivityTimestamp = (timestamp = Date.now()) => {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(timestamp));
};

export const getLastActivityTimestamp = () => {
  const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? null : value;
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(EXPIRES_IN_KEY);
  localStorage.removeItem(LAST_REFRESH_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

export const isTokenExpiringSoon = (thresholdMs) => {
  const expirationDate = getTokenExpirationDate();
  if (!expirationDate) return false;
  return expirationDate.getTime() <= Date.now() + thresholdMs;
};

export const isTokenExpired = () => {
  const expirationDate = getTokenExpirationDate();
  if (!expirationDate) return false;
  return expirationDate.getTime() <= Date.now();
};
