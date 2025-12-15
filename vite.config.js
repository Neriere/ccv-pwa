import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = env.VITE_APP_BASE || "/pwa/";

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
          lang: "es",
          start_url: base,
          scope: base,
          icons: [
            {
              src: "icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
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
