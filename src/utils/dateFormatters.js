/**
 * Formatea hora de HH:MM:SS a HH:MM
 * @param {string} hora - Hora en formato HH:MM:SS o HH:MM
 * @returns {string} Hora formateada como HH:MM
 */
export const formatHora = (hora) => {
  if (!hora) return "";
  if (hora.length === 5) return hora; // Ya está en HH:MM
  return hora.substring(0, 5);
};

/**
 * Formatea fecha local evitando problemas UTC
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada localmente
 */
export const formatFechaLocal = (fecha) => {
  if (!fecha) {
    return "";
  }
  // Parsear fecha como YYYY-MM-DD (string)
  const [year, month, day] = fecha.split("-").map(Number);

  // Crear fecha en zona horaria local (no UTC)
  const dt = new Date(year, month - 1, day);

  return dt.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Convierte objeto fecha a string YYYY-MM-DD
 * @param {number} year - Año
 * @param {number} month - Mes (1-12)
 * @param {number} day - Día
 * @returns {string} Fecha como string YYYY-MM-DD
 */
export const formatDateToInput = (year, month, day) => {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
};
