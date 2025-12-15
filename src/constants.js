/**
 * Constantes globales de la aplicación
 * Centraliza todos los valores constantes para fácil mantenimiento
 */

export const MESES = Object.freeze([
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]);

export const WEEKDAYS = Object.freeze([
  "Lun",
  "Mar",
  "Mié",
  "Jue",
  "Vie",
  "Sáb",
  "Dom",
]);

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export const STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  ASSIGNMENTS: "mis_asig_ids",
  THEME: "app_theme",
});

export const TIMEOUTS = Object.freeze({
  HOUR_IN_MS: 60 * 60 * 1000,
  MIN_DELAY: 5 * 60 * 1000,
  MAX_DELAY: 24 * 60 * 60 * 1000,
  TOAST_DURATION: 5000,
});

export const VALIDATION = Object.freeze({
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 150,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
});
