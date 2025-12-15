import React from "react";
import { Link } from "react-router-dom";
import { usePwaInstallPrompt } from "../hooks/usePwaInstallPrompt";

export default function InstallPage() {
  const { installed, isIos, inApp, canPromptInstall, promptInstall } =
    usePwaInstallPrompt();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold text-gray-900">Instalar app</h1>
        <p className="mt-2 text-gray-600">
          Instalar la PWA agrega un ícono a tu pantalla de inicio. Al abrirla
          desde ese ícono se ve como “app” (sin barra de URL), aunque por dentro
          sigue siendo la misma aplicación web.
        </p>

        {installed && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 text-green-800 text-sm">
            La app ya está instalada. Búscala en tu pantalla de inicio y ábrela
            desde el ícono.
          </div>
        )}

        {!installed && inApp && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 text-yellow-900 text-sm">
            Estás usando un navegador integrado (por ejemplo, dentro de una
            app). Para poder instalar, abre este link en Chrome/Edge (Android) o
            Safari (iPhone/iPad).
          </div>
        )}

        {!installed && isIos && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-900 text-sm">
            iPhone/iPad (Safari): toca “Compartir” y luego “Añadir a pantalla de
            inicio”.
          </div>
        )}

        {!installed && !isIos && !canPromptInstall && (
          <div className="mt-4 p-3 rounded-lg bg-gray-100 text-gray-700 text-sm">
            Android (Chrome/Edge): abre el menú (⋮) y elige “Instalar
            aplicación” / “Añadir a pantalla de inicio”.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {canPromptInstall && !inApp && (
            <button
              type="button"
              onClick={promptInstall}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Instalar
            </button>
          )}

          <Link
            to="/"
            className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-50"
          >
            Abrir app
          </Link>
        </div>
      </div>
    </div>
  );
}
