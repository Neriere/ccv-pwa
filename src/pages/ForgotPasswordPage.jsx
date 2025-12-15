import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordResetLink } from "../services";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isDisabled = useMemo(() => !email || loading, [email, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await requestPasswordResetLink({ email });
      setMessage(
        result?.message ||
          "Si el correo existe, te enviaremos un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      setError(err?.message || "No se pudo enviar el correo de recuperación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-screen min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Recuperar contraseña
          </h1>
          <p className="text-gray-400">
            Ingresa tu correo y te enviaremos un enlace
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-600"
            >
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </form>

          {message && (
            <div className="mt-4 p-4 rounded-lg text-center font-medium bg-green-500/90 text-white">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 rounded-lg text-center font-medium bg-red-500/90 text-white">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
