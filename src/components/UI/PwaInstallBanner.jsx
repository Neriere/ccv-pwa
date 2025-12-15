import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePwaInstallPrompt } from "../../hooks/usePwaInstallPrompt";

export function PwaInstallBanner() {
  const { installed, isIos, inApp, canPromptInstall, promptInstall } =
    usePwaInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    if (installed) return false;

    // Show on iOS (instructions) and on installable browsers.
    return isIos || canPromptInstall;
  }, [dismissed, installed, isIos, canPromptInstall]);

  if (!shouldShow) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900">Instala la app</p>
          {inApp ? (
            <p className="text-sm text-blue-900/90">
              Estás en un navegador integrado. Abre este link en Chrome/Edge
              (Android) o Safari (iPhone/iPad) para poder instalar.
            </p>
          ) : isIos ? (
            <p className="text-sm text-blue-900/90">
              iPhone/iPad: toca “Compartir” → “Añadir a pantalla de inicio”.
            </p>
          ) : (
            <p className="text-sm text-blue-900/90">
              Instala la PWA para tener un ícono en tu pantalla de inicio.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!inApp && canPromptInstall && (
            <button
              type="button"
              onClick={promptInstall}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Instalar
            </button>
          )}

          <Link
            to="/install"
            className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-900 text-sm hover:bg-blue-100"
          >
            Ver pasos
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="px-2 py-1.5 text-blue-900/70 hover:text-blue-900 text-sm"
            aria-label="Cerrar"
            title="Cerrar"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
