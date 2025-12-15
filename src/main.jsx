import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./ThemeContext";
import AuthProvider from "./contexts/AuthContext";
import { initPwaInstallPromptStore } from "./utils/pwaInstallPromptStore";

const queryClient = new QueryClient();
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

initPwaInstallPromptStore();

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-100 text-center p-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Ocurrió un error inesperado.
          </h1>
          {error?.message && (
            <p className="text-gray-600">
              Detalle: <span className="font-mono">{error.message}</span>
            </p>
          )}
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  let updateSW;
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      try {
        updateSW?.(true);
      } catch {
        void 0;
      }
    },
  });
}
