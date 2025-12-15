import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner, AccessDenied } from "./UI/LoadingSpinner";

/**
 * Componente que protege rutas requiriendo autenticación
 * Redirige a /login si el usuario no está autenticado
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos a renderizar si está autenticado
 * @param {string[]} props.roles - Roles permitidos (opcional)
 * @param {string} props.redirectTo - Ruta de redirección (default: '/login')
 */
export default function ProtectedRoute({
  children,
  roles = [],
  redirectTo = "/login",
}) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner message="Verificando sesión..." />;
  }
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }
  if (roles.length > 0 && user) {
    const userRole = user.role_name?.toLowerCase() || "";
    const hasRequiredRole = roles.some((role) =>
      userRole.includes(role.toLowerCase())
    );

    if (!hasRequiredRole) {
      return <AccessDenied requiredRoles={roles} />;
    }
  }
  return children;
}
