import React from "react";
import { Link, Outlet } from "react-router-dom";
import { OfflineBanner } from "./UI/OfflineBanner";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <>
      <OfflineBanner />
      <div className="dashboard-layout">
        <nav className="sidebar">
          <h2>Menú</h2>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/usuarios">Usuarios</Link>
            </li>
            <li>
              <Link to="/roles">Roles</Link>
            </li>
            <li>
              <Link to="/agenda">Agenda</Link>
            </li>
            <li>
              <Link to="/ajustes">Ajustes</Link>
            </li>
          </ul>
        </nav>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
