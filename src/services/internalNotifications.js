const STORAGE_KEY = "internal_notifications_v1";

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function loadAll() {
  if (typeof window === "undefined") {
    return [];
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const list = safeParse(raw || "[]", []);
  return Array.isArray(list) ? list : [];
}

function saveAll(list) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addInternalNotification({
  type = "info",
  title,
  body,
  data,
} = {}) {
  if (!title && !body) {
    return;
  }

  const now = Date.now();
  const item = {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    type,
    title: title || "Notificación",
    body: body || "",
    data: data || null,
    createdAt: now,
    readAt: null,
  };

  const current = loadAll();
  saveAll([item, ...current].slice(0, 200));
}

export function listInternalNotifications() {
  return loadAll();
}

export function markInternalNotificationRead(id) {
  if (!id) {
    return;
  }
  const current = loadAll();
  const next = current.map((item) =>
    item?.id === id && !item?.readAt ? { ...item, readAt: Date.now() } : item
  );
  saveAll(next);
}

export function markAllInternalNotificationsRead() {
  const current = loadAll();
  const now = Date.now();
  const next = current.map((item) =>
    item && !item.readAt ? { ...item, readAt: now } : item
  );
  saveAll(next);
}

export function clearInternalNotifications() {
  saveAll([]);
}
