import { useState, useEffect } from "react";

/**
 * OfflineBanner - Notifica al usuario cuando pierde conexión a internet
 *
 * Características:
 * - Aparece solo cuando navigator.onLine es false
 * - Se posiciona sticky en el top de la pantalla
 * - Desaparece automáticamente al reconectar
 * - Usa eventos 'online' y 'offline' del navegador
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("✅ Conexión recuperada");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("❌ Sin conexión");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 text-center z-50 shadow-md animate-in slide-in-from-top">
      <span className="flex items-center justify-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>Sin conexión. Algunos datos pueden no estar actualizados.</span>
      </span>
    </div>
  );
}
