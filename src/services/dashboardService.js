import api from "./apiService";

/**
 * Servicio para Dashboard
 */

export const getDashboard = async () => {
  try {
    const data = await api.get("/dashboard");
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    throw error;
  }
};
