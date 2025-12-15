import api from "./apiService";

/**
 * Servicio limitado al calendario de eventos utilizado en la PWA.
 */

export const getCalendario = async (params = {}) => {
  try {
    const data = await api.get("/calendario", params);
    return data;
  } catch (error) {
    console.error("Error al obtener calendario:", error);
    throw error;
  }
};

/**
 * Obtener lista de tipos de eventos disponibles
 */
export const getTiposEventos = async () => {
  try {
    const data = await api.get("/tipos-evento");
    return data;
  } catch (error) {
    console.error("Error al obtener tipos de eventos:", error);
    throw error;
  }
};

/**
 * Crear un nuevo evento
 */
export const createEvento = async (eventoData) => {
  try {
    const data = await api.post("/eventos", eventoData);
    return data;
  } catch (error) {
    console.error("Error al crear evento:", error);
    throw error;
  }
};

/**
 * Actualizar un evento existente
 */
export const updateEvento = async (eventoId, eventoData) => {
  try {
    const data = await api.put(`/eventos/${eventoId}`, eventoData);
    return data;
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    throw error;
  }
};

/**
 * Eliminar un evento
 */
export const deleteEvento = async (eventoId) => {
  try {
    const data = await api.delete(`/eventos/${eventoId}`);
    return data;
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    throw error;
  }
};
