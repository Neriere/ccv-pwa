import React, {
  useState,
  useEffect,
  createContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  login as loginService,
  logout as logoutService,
  getCurrentUser,
  hasActiveSession,
  getStoredUser,
  getStoredToken,
  clearSession,
  getTokenExpiration,
  markUserActivity,
  getLastRecordedActivity,
} from "../services";
const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutos
const TOKEN_REFRESH_EVENT = "auth:token-refreshed";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const inactivityTimerRef = useRef(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setLoading(true);

    try {
      await logoutService();
    } catch (error) {
      console.warn("Error al cerrar sesión en servidor:", error);
    } finally {
      setUser(null);
      setToken(null);
      setTokenExpiresAt(null);
      setError(null);
      clearSession();
      clearInactivityTimer();
      setLoading(false);
    }
  }, [clearInactivityTimer]);

  const scheduleInactivityLogout = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      console.warn("Cerrando sesión por inactividad");
      handleLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearInactivityTimer, handleLogout]);

  const handleLogin = useCallback(
    async (credentials) => {
      setError(null);
      setLoading(true);

      try {
        const response = await loginService(credentials);
        if (response.success) {
          setUser(response.user || null);
          setToken(response.token);
          setTokenExpiresAt(response.expiresAt || getTokenExpiration());
          markUserActivity();
          scheduleInactivityLogout();
          return { success: true, user: response.user || null };
        }
        const msg = response.message || "Credenciales inválidas";
        setError(msg);
        return { success: false, error: msg };
      } catch (error) {
        const errorMessage =
          error.message || "Error de conexión con el servidor";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [scheduleInactivityLogout]
  );
  useEffect(() => {
    const initializeSession = async () => {
      setLoading(true);

      if (!hasActiveSession()) {
        clearSession();
        setLoading(false);
        return;
      }

      const storedUser = getStoredUser();
      const storedToken = getStoredToken();
      const storedExpiration = getTokenExpiration();

      if (storedUser) {
        setUser(storedUser);
      }
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedExpiration) {
        setTokenExpiresAt(storedExpiration);
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.warn("Token expirado o inválido, cerrando sesión", error);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [handleLogout]);

  useEffect(() => {
    const handleTokenRefresh = (event) => {
      const {
        token: refreshedToken,
        user: refreshedUser,
        expiresAt,
      } = event.detail || {};
      if (refreshedToken) {
        setToken(refreshedToken);
      }
      if (refreshedUser) {
        setUser(refreshedUser);
      }
      if (expiresAt) {
        setTokenExpiresAt(expiresAt);
      }
      markUserActivity();
      scheduleInactivityLogout();
    };

    window.addEventListener(TOKEN_REFRESH_EVENT, handleTokenRefresh);
    return () => {
      window.removeEventListener(TOKEN_REFRESH_EVENT, handleTokenRefresh);
    };
  }, [scheduleInactivityLogout]);
  useEffect(() => {
    if (!token) {
      clearInactivityTimer();
      return;
    }

    const activityEvents = [
      "click",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
    ];

    const handleActivity = () => {
      markUserActivity();
      scheduleInactivityLogout();
    };

    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, handleActivity)
    );

    scheduleInactivityLogout();

    return () => {
      activityEvents.forEach((eventName) =>
        window.removeEventListener(eventName, handleActivity)
      );
      clearInactivityTimer();
    };
  }, [token, scheduleInactivityLogout, clearInactivityTimer]);
  useEffect(() => {
    if (!token) return;
    const lastActivity = getLastRecordedActivity();
    if (!lastActivity) {
      markUserActivity();
    }
  }, [token]);

  const value = useMemo(() => {
    const roleName = (usr) =>
      usr?.role_name ||
      usr?.role ||
      (Array.isArray(usr?.roles) ? usr.roles[0] : null);
    const roleId = (usr) =>
      typeof usr?.role_id === "number"
        ? usr.role_id
        : typeof usr?.roluser_id === "number"
        ? usr.roluser_id
        : undefined;

    const isUserAdmin = () =>
      roleName(user)?.toString().toLowerCase() === "admin" ||
      roleId(user) === 1;
    const isUserLider = () =>
      roleName(user)?.toString().toLowerCase() === "lider" ||
      roleId(user) === 2;
    const isUserMiembro = () =>
      roleName(user)?.toString().toLowerCase() === "miembro" ||
      roleId(user) === 3;

    const canManageUsers = () => isUserAdmin() || isUserLider();
    const canManageEvents = () => isUserAdmin() || isUserLider();
    const canViewDashboard = () => !!user;

    return {
      user,
      token,
      tokenExpiresAt,
      loading,
      error,
      isAuthenticated: !!token,
      login: handleLogin,
      logout: handleLogout,
      canManageUsers,
      canManageEvents,
      canViewDashboard,
      isAdmin: isUserAdmin,
      isLider: isUserLider,
      isMiembro: isUserMiembro,
    };
  }, [user, token, tokenExpiresAt, loading, error, handleLogin, handleLogout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export default AuthProvider;
