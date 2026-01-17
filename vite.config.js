import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBase = env.VITE_APP_BASE || "/pwa/";
  const normalizedBase = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
  const base = normalizedBase.endsWith("/")
    ? normalizedBase
    : `${normalizedBase}/`;

  return {
    base,
    plugins: [
      tailwindcss(),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["vite.svg"],
        strategies: "injectManifest",
        srcDir: "src",
        filename: "sw.js",
        manifest: {
          name: "Gestión Activa CCV",
          short_name: "Gestión Activa",
          description: "Sistema de gestión de eventos y asignaciones",
          theme_color: "#1976d2",
          background_color: "#ffffff",
          display: "standalone",
          lang: "es-MX",
          dir: "ltr",
          orientation: "portrait-primary",
          categories: ["productivity", "utilities", "lifestyle"],

          // Important: keep installed PWA inside the deployed base path.
          start_url: base,
          scope: base,
          icons: [
            {
              src: "icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],

          shortcuts: [
            {
              name: "Dashboard",
              short_name: "Inicio",
              description: "Ver estadísticas generales",
              url: "dashboard",
              icons: [{ src: "icon-192x192.png", sizes: "192x192" }],
            },
            {
              name: "Agenda",
              short_name: "Eventos",
              description: "Ver y gestionar eventos",
              url: "agenda",
              icons: [{ src: "icon-192x192.png", sizes: "192x192" }],
            },
          ],
        },
        injectManifest: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,json}"],
        },
      }),
    ],
  };
});
