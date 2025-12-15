import api from "./apiService";

const STORAGE_KEY = "notifications_enabled_v1";

export function getLocalNotificationsEnabled() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return true;
  return raw === "1";
}

export function setLocalNotificationsEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
}

export async function fetchNotificationSettings() {
  const payload = await api.get("/notification-settings");
  const enabled = payload?.data?.enabled;
  return typeof enabled === "boolean" ? enabled : true;
}

export async function updateNotificationSettings(enabled) {
  const payload = await api.put("/notification-settings", { enabled });
  const value = payload?.data?.enabled;
  return typeof value === "boolean" ? value : enabled;
}
