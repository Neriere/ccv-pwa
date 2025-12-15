import api from "./apiService";

/**
 * Servicio reducido de asignaciones.
 */

export const getMisAsignaciones = async () => {
  try {
    const data = await api.get("/asignaciones/mis-asignaciones");
    return data;
  } catch (error) {
    console.error("Error al obtener mis asignaciones:", error);
    throw error;
  }
};

// Función genérica para obtener asignaciones por filtro
export const getAsignacionesBy = async (
  filterKey,
  filterValue,
  errorContext
) => {
  try {
    const data = await api.get("/asignaciones", { [filterKey]: filterValue });
    return data;
  } catch (error) {
    console.error(`Error al obtener asignaciones ${errorContext}:`, error);
    throw error;
  }
};

// Wrappers específicos
export const getAsignacionesPorEvento = (evento_id) =>
  getAsignacionesBy("evento_id", evento_id, "por evento");

export const getAsignacionesPorUsuario = (usuario_id) =>
  getAsignacionesBy("usuario_id", usuario_id, "por usuario");
