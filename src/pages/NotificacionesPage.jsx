import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import {
  clearInternalNotifications,
  listInternalNotifications,
  markAllInternalNotificationsRead,
  markInternalNotificationRead,
} from "../services/internalNotifications";

const styles = {
  container: {
    padding: "1.5rem",
    maxWidth: "40rem",
    margin: "0 auto",
    paddingBottom: "6rem",
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    transition: "var(--transition-theme)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  button: {
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    fontWeight: 600,
  },
  card: {
    background: "var(--bg-elevated)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-elevated)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "0.75rem",
    overflow: "hidden",
  },
  item: {
    padding: "0.9rem 1rem",
    borderBottom: "1px solid var(--border-subtle)",
    cursor: "pointer",
  },
  itemHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "0.75rem",
    marginBottom: "0.25rem",
  },
  itemTitle: { fontWeight: 700 },
  itemMeta: { color: "var(--text-muted)", fontSize: "0.8rem" },
  itemBody: { color: "var(--text-primary)", opacity: 0.95 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "var(--state-info-text)",
    flex: "0 0 auto",
    marginTop: 6,
  },
  empty: {
    color: "var(--text-muted)",
    padding: "1rem",
  },
  back: {
    marginBottom: "1rem",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    fontWeight: 600,
    cursor: "pointer",
  },
};

function formatDate(ms) {
  if (!ms) {
    return "";
  }
  try {
    return new Date(ms).toLocaleString();
  } catch {
    return "";
  }
}

export default function NotificacionesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [source, setSource] = useState("api");

  const unreadCount = useMemo(
    () => items.filter((item) => item && !item.readAt).length,
    [items]
  );

  const refresh = async () => {
    try {
      const result = await listNotifications({ limit: 100 });
      setItems(result.items || []);
      setSource("api");
    } catch {
      setItems(listInternalNotifications());
      setSource("local");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleItemClick = (item) => {
    if (!item?.id) {
      return;
    }

    if (source === "api") {
      markNotificationRead(item.id).finally(refresh);
    } else {
      markInternalNotificationRead(item.id);
      refresh();
    }

    const url = item?.data?.url;
    if (typeof url === "string" && url.startsWith("/")) {
      navigate(url);
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.back} type="button" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div style={styles.headerRow}>
        <h1 style={styles.title}>Notificaciones</h1>
        <div style={styles.actions}>
          <button
            type="button"
            style={styles.button}
            onClick={() => {
              if (source === "api") {
                markAllNotificationsRead().finally(refresh);
              } else {
                markAllInternalNotificationsRead();
                refresh();
              }
            }}
            disabled={items.length === 0 || unreadCount === 0}
          >
            Marcar todas como leídas
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={() => {
              if (source === "api") {
                clearNotifications().finally(refresh);
              } else {
                clearInternalNotifications();
                refresh();
              }
            }}
            disabled={items.length === 0}
          >
            Limpiar
          </button>
        </div>
      </div>

      <section style={styles.card}>
        {items.length === 0 ? (
          <div style={styles.empty}>No hay notificaciones aún.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.item,
                background: item.readAt
                  ? "var(--bg-elevated)"
                  : "var(--bg-app)",
              }}
              role="button"
              tabIndex={0}
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleItemClick(item);
                }
              }}
            >
              <div style={styles.itemHeader}>
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  {!item.readAt ? <span style={styles.unreadDot} /> : null}
                  <div>
                    <div style={styles.itemTitle}>{item.title}</div>
                    <div style={styles.itemMeta}>
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={styles.itemMeta}>{item.type || ""}</div>
              </div>
              {item.body ? (
                <div style={styles.itemBody}>{item.body}</div>
              ) : null}
            </div>
          ))
        )}
      </section>
    </div>
  );
}
