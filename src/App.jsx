import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MaterialBottomNav from "./components/MaterialBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { LoadingSpinner } from "./components/UI/LoadingSpinner";

import { lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UsuariosPage = lazy(() => import("./pages/UsuariosPage"));
const AgendaPage = lazy(() => import("./pages/AgendaPage"));
const AjustesPage = lazy(() => import("./pages/AjustesPage"));
const NotificacionesPage = lazy(() => import("./pages/NotificacionesPage"));
const LoginPage = lazy(() => import("./pages/Login"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const InstallPage = lazy(() => import("./pages/InstallPage"));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<LoadingSpinner message="Cargando página..." />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MaterialBottomNav />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="notificaciones" element={<NotificacionesPage />} />
              <Route path="ajustes" element={<AjustesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
