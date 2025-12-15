import React, { useContext } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../context/ThemeContext";
import { PwaInstallBanner } from "./UI/PwaInstallBanner";
import "./MaterialBottomNav.css";

const tabs = [
  {
    to: "/dashboard",
    label: "Inicio",
    icon: (theme) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme === "dark" ? "#f8fafc" : "#000000ff"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5 12 3l9 6.5" />
        <path d="M5 10v9h5v-5h4v5h5v-9" />
      </svg>
    ),
  },
  {
    to: "/usuarios",
    label: "Usuarios",
    icon: (theme) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme === "dark" ? "#f8fafc" : "#0f172a"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M18 21v-1a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v1" />
        <path d="M19 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path d="M21 21v-1a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    to: "/agenda",
    label: "Agenda",
    icon: (theme) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme === "dark" ? "#f8fafc" : "#0f172a"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: "/notificaciones",
    label: "Notificaciones",
    icon: (theme) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme === "dark" ? "#f8fafc" : "#0f172a"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    to: "/ajustes",
    label: "Ajustes",
    icon: (theme) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke={theme === "dark" ? "#f8fafc" : "#0f172a"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.78 1.78 0 0 0 .4 2l.1.1a2 2 0 1 1-2.83 2.83l-.1-.1a1.78 1.78 0 0 0-2-.4 1.78 1.78 0 0 0-1 1.62V21a2 2 0 1 1-4 0v-.2a1.78 1.78 0 0 0-1-1.62 1.78 1.78 0 0 0-2 .4l-.1.1a2 2 0 1 1-2.83-2.83l.1-.1a1.78 1.78 0 0 0 .4-2 1.78 1.78 0 0 0-1.62-1H3a2 2 0 1 1 0-4h.2a1.78 1.78 0 0 0 1.62-1 1.78 1.78 0 0 0-.4-2l-.1-.1a2 2 0 1 1 2.83-2.83l.1.1a1.78 1.78 0 0 0 2 .4h.2A1.78 1.78 0 0 0 11 3.2V3a2 2 0 1 1 4 0v.2a1.78 1.78 0 0 0 1 1.62 1.78 1.78 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.83 2.83l-.1.1a1.78 1.78 0 0 0-.4 2c0 .46.18.9.5 1.22.32.32.76.5 1.22.5H21a2 2 0 1 1 0 4h-.2a1.78 1.78 0 0 0-1.62 1Z" />
      </svg>
    ),
  },
];

const MaterialBottomNav = () => {
  const location = useLocation();
  useAuth();
  const { theme } = useContext(ThemeContext);
  const visibleTabs = tabs;

  return (
    <div className="material-layout">
      <main className="material-main">
        <PwaInstallBanner />
        <Outlet />
      </main>
      <nav className="material-bottom-nav">
        {visibleTabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={location.pathname === tab.to ? "active" : ""}
          >
            <div className="icon-wrapper">{tab.icon(theme)}</div>
            <span className="label">{tab.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MaterialBottomNav;
