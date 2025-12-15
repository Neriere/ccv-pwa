import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../components/UI/LoadingSpinner";
import "./DashboardPage.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await getDashboard();
      return response;
    },
    staleTime: 1000 * 60,
  });

  if (isLoading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="dashboard-error-box">
          <p className="dashboard-error-title">Error</p>
          <p className="dashboard-error-message">
            {error.message || "No se pudieron cargar las estadísticas"}
          </p>
        </div>
      </div>
    );
  }

  const dashboardData = data ?? {};
  const genderCounts = dashboardData.genderCounts || { M: 0, F: 0 };
  const recentUsers = dashboardData.recentUsers || [];
  const ageRanges = dashboardData.ageRanges || {};
  const totalActiveMembers = dashboardData.totalActiveMembers || 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Inicio</h1>
        <p className="dashboard-subtitle">
          Bienvenido,{" "}
          <span className="user-name">{user?.name || "Usuario"}</span>
        </p>
      </div>
      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-value">{totalActiveMembers}</div>
          <div className="dashboard-stat-label">Miembros Activos</div>
        </div>
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-value">{recentUsers.length}</div>
          <div className="dashboard-stat-label">Usuarios Recientes</div>
        </div>
      </div>
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">📊 Distribución por Género</h2>
        <div className="dashboard-gender-dist">
          <div className="dashboard-gender-item">
            <div className="dashboard-gender-value">{genderCounts.M}</div>
            <div className="dashboard-gender-label">Hombres</div>
          </div>
          <div className="dashboard-gender-item">
            <div className="dashboard-gender-value">{genderCounts.F}</div>
            <div className="dashboard-gender-label">Mujeres</div>
          </div>
        </div>
      </div>
      {recentUsers.length > 0 && (
        <div className="dashboard-section dashboard-table-wrapper">
          <h2 className="dashboard-section-title">
            🧑‍💻 Últimos Usuarios Agregados
          </h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u?.member?.nombre || u?.name || "—"}</td>
                  <td>{u?.member?.apellidoPaterno || "—"}</td>
                  <td>
                    {u?.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {Object.keys(ageRanges).length > 0 && (
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">
            📊 Distribución por Edades
          </h2>
          <div className="space-y-2">
            {Object.entries(ageRanges).map(([range, count]) => (
              <div key={range} className="flex justify-between items-center">
                <span className="dashboard-age-label">{range} años</span>
                <div className="flex items-center gap-2">
                  <div className="dashboard-progress-bar">
                    <div
                      className="dashboard-progress-fill"
                      style={{
                        width: `${
                          totalActiveMembers > 0
                            ? (count / totalActiveMembers) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="dashboard-age-count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
