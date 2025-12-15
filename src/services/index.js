/**
 * Exportación centralizada de todos los servicios de la API
 * Importar como: import { login, getEventos, ... } from './services';
 */

// Servicio de autenticación utilizado por la PWA
export {
  login,
  logout,
  getCurrentUser,
  hasActiveSession,
  getStoredUser,
  getStoredToken,
  clearSession,
  refreshToken,
  getTokenExpiration,
  getTokenSecondsToExpire,
  markUserActivity,
  getLastRecordedActivity,
} from "./authService";

// Servicio de calendario de eventos
export { getCalendario } from "./eventoService";

// Servicio de asignaciones del usuario autenticado
export { getMisAsignaciones } from "./asignacionService";

// Servicio de personas normalizadas (directorio)
export { listPersonsNormalized } from "./personService";

// Servicio de dashboard
export { getDashboard } from "./dashboardService";

// Reset de contraseña
export {
  requestPasswordResetLink,
  resetPasswordWithToken,
} from "./passwordResetService";

// Notificaciones (internas + settings)
export {
  getLocalNotificationsEnabled,
  setLocalNotificationsEnabled,
  fetchNotificationSettings,
  updateNotificationSettings,
} from "./notificationSettingsService";

export {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} from "./notificationService";

// API base (por si se necesita acceso directo)
export { default as api } from "./apiService";
