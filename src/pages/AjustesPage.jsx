import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import {
  fetchNotificationSettings,
  getLocalNotificationsEnabled,
  setLocalNotificationsEnabled,
  updateNotificationSettings,
} from "../services/notificationSettingsService";
import {
  subscribeWebPush,
  testWebPush,
  unsubscribeWebPush,
} from "../services/pushService";

const ROLE_NAMES = {
  1: "Administrador",
  2: "Colaborador",
  3: "Líder",
  4: "Inactivo",
};

const styles = {
  container: {
    padding: "1.5rem",
    maxWidth: "28rem",
    margin: "0 auto",
    paddingBottom: "6rem",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    transition: "var(--transition-theme)",
  },
  card: {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  cardOverflow: {
    background: "var(--bg-elevated)",
    boxShadow: "var(--shadow-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "0.5rem",
    overflow: "hidden",
    marginBottom: "1.5rem",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid var(--border-subtle)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
  },
  labelMuted: { color: "var(--text-muted)", fontSize: "0.875rem" },
  valuePrimary: { color: "var(--text-primary)", fontWeight: 500 },
  warningText: {
    color: "var(--state-warning-text)",
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoutBtn:
    "w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md",
  secondaryButton: {
    width: "100%",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    borderRadius: "0.5rem",
    padding: "0.85rem 1rem",
    fontWeight: 700,
    marginTop: "0.75rem",
  },
};

const InfoRow = ({ label, children }) => (
  <div style={{ marginBottom: 12 }}>
    <p style={styles.labelMuted}>{label}</p>
    <p style={styles.valuePrimary}>{children}</p>
  </div>
);

const AjustesPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
    try {
      return getLocalNotificationsEnabled();
    } catch {
      return true;
    }
  });

  const showPushTestButton =
    String(import.meta.env?.VITE_SHOW_PUSH_TEST_BUTTON || "") === "1";

  const resolveRoleId = (usr) => {
    const candidates = [
      usr?.roluser_id,
      usr?.role_id,
      usr?.roluser?.id,
      usr?.role?.id,
      usr?.roluserId,
      usr?.roleId,
    ];

    for (const value of candidates) {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number.parseInt(value, 10);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  };

  const roleId = resolveRoleId(user);
  const roleLabel = roleId ? ROLE_NAMES[roleId] || `ID ${roleId}` : null;

  const roleRefreshAttemptedRef = useRef(false);
  useEffect(() => {
    if (roleRefreshAttemptedRef.current) return;
    if (authLoading) return;
    if (!user) return;
    if (roleLabel) return;
    if (typeof refreshUser !== "function") return;

    roleRefreshAttemptedRef.current = true;
    refreshUser();
  }, [authLoading, user, roleLabel, refreshUser]);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await logout();
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    let isCancelled = false;

    const sync = async () => {
      try {
        const enabled = await fetchNotificationSettings();
        if (isCancelled) return;
        setLocalNotificationsEnabled(enabled);
        setNotificationsEnabledState(enabled);
      } catch {
        // Si el backend aún no expone settings, mantener local.
      }
    };

    sync();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div style={styles.container}>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Ajustes
      </h1>

      <section style={styles.card}>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Información de Usuario
        </h2>

        <div>
          <InfoRow label="Nombre">{user?.name || "N/A"}</InfoRow>

          <InfoRow label="Email">{user?.email || "N/A"}</InfoRow>

          <InfoRow label="Rol">
            {roleLabel
              ? roleLabel
              : authLoading
              ? "Cargando…"
              : "No disponible"}
          </InfoRow>
        </div>
      </section>
      <section style={styles.cardOverflow}>
        <div style={styles.itemRow}>
          <span style={{ color: "var(--text-primary)" }}>
            Tema: {theme === "dark" ? "Oscuro" : "Claro"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={theme === "dark"}
              onChange={toggleTheme}
              aria-label="Alternar tema claro/oscuro"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" />
          </label>
        </div>
        <div style={styles.itemRow}>
          <span style={{ color: "var(--text-primary)" }}>Notificaciones</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={!!notificationsEnabled}
              onChange={async (e) => {
                const next = !!e.target.checked;
                setNotificationsEnabledState(next);
                try {
                  setLocalNotificationsEnabled(next);
                } catch {
                  void 0;
                }

                try {
                  const persisted = await updateNotificationSettings(next);
                  setLocalNotificationsEnabled(!!persisted);
                  setNotificationsEnabledState(!!persisted);
                } catch {
                  void 0;
                }

                // Suscripción / desuscripción Web Push
                // Nota: si el usuario deniega permiso, el toggle quedará activado para notificaciones internas (campana),
                // pero no habrá push del sistema.
                try {
                  if (next) {
                    await subscribeWebPush();
                  } else {
                    await unsubscribeWebPush();
                  }
                } catch {
                  void 0;
                }
              }}
              aria-label="Alternar notificaciones"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </section>
      <button onClick={handleLogout} className={styles.logoutBtn}>
        Cerrar Sesión
      </button>

      {showPushTestButton ? (
        <button
          type="button"
          style={{
            ...styles.secondaryButton,
            opacity: notificationsEnabled ? 1 : 0.6,
            cursor: notificationsEnabled ? "pointer" : "not-allowed",
          }}
          disabled={!notificationsEnabled}
          onClick={async () => {
            try {
              const result = await testWebPush();
              window.alert(
                `Push test OK: ${JSON.stringify(result?.result ?? result)}`
              );
            } catch (e) {
              window.alert(`Push test ERROR: ${e?.message || e}`);
            }
          }}
        >
          Probar Push (temporal)
        </button>
      ) : null}

      <p
        className="text-center text-xs mt-6"
        style={{ color: "var(--text-muted)" }}
      >
        Versión 1.0.0 | © 2025 CCV
      </p>
    </div>
  );
};

export default AjustesPage;
