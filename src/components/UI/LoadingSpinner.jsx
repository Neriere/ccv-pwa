import React from "react";

/**
 * Componente de carga reutilizable
 * Muestra un spinner animado con mensaje personalizado
 */
export function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

/**
 * Componente de acceso denegado
 * Muestra un mensaje cuando el usuario no tiene permisos
 */
export function AccessDenied({ requiredRoles = [] }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-red-500 text-5xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Acceso Denegado
        </h2>
        <p className="text-gray-600 mb-4">
          No tienes permisos para acceder a esta sección.
        </p>
        {requiredRoles.length > 0 && (
          <p className="text-sm text-gray-500">
            Rol requerido: {requiredRoles.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
