import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginCard from "../components/Auth/LoginCard";
import { useAuth } from "../hooks/useAuth";
import { PwaInstallBanner } from "../components/UI/PwaInstallBanner";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirigir a dashboard si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async ({ identifier, password }) => {
    setLoading(true);
    setMessage("");

    try {
      const result = await login({ email: identifier, password });

      if (result.success) {
        setMessage("¡Inicio de sesión exitoso! Redirigiendo...");
        // El redirect se maneja en el useEffect
      } else {
        setMessage(result.error || "Credenciales incorrectas");
      }
    } catch (err) {
      setMessage(err.message || "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex flex-col">
      <PwaInstallBanner />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LoginCard onSubmitLogin={handleLogin} />

          {loading && (
            <div className="mt-6 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-white text-sm font-medium">
                Iniciando sesión...
              </p>
            </div>
          )}

          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-center font-medium backdrop-blur-sm ${
                message.includes("exitoso")
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
