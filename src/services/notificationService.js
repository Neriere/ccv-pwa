import api from "./apiService";

function normalizeItem(item) {
  if (!item) return null;

  const createdAt = item.created_at ? Date.parse(item.created_at) : undefined;
  const readAt = item.read_at ? Date.parse(item.read_at) : null;

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    data: item.data_json || {},
    createdAt: Number.isFinite(createdAt) ? createdAt : undefined,
    readAt: Number.isFinite(readAt) ? readAt : null,
    raw: item,
  };
}

export async function listNotifications({ limit = 50 } = {}) {
  const payload = await api.get("/notifications", { limit });
  const list = Array.isArray(payload?.data) ? payload.data : [];
  const items = list.map(normalizeItem).filter(Boolean);
  const unread = typeof payload?.unread === "number" ? payload.unread : null;
  return { items, unread };
}

export async function markNotificationRead(id) {
  const payload = await api.post(`/notifications/${id}/read`, {});
  return normalizeItem(payload?.data);
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all", {});
}

export async function clearNotifications() {
  await api.delete("/notifications");
}
