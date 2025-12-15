# Gestión Activa PWA

PWA móvil-first para la comunidad Cita con la Verdad (CCV). Incluye agenda/calendario de eventos, dashboard y gestión de usuarios, consumiendo una API backend.

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm 9+

## Instalación y ejecución

```powershell
npm install
npm run dev
```

Vite mostrará la URL local (por defecto `http://localhost:5173`).

## Variables de entorno

Este proyecto usa variables `VITE_*` (Vite). Puedes partir desde `.env.example`.

```dotenv
# API del backend (sin slash final)
VITE_API_BASE_URL=https://gestionactiva.citaconlaverdad.com/api

# Base path de despliegue (por defecto "/pwa/")
# Útil si se publica en subcarpeta: https://dominio.tld/pwa/
VITE_APP_BASE=/pwa/

# (Opcional) Sentry
VITE_SENTRY_DSN=

```

## Scripts

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción (genera `dist/`)
- `npm run preview`: sirve el build localmente
- `npm run lint`: ESLint

## PWA

- Configuración en [vite.config.js](vite.config.js) usando `vite-plugin-pwa` con estrategia `injectManifest`.
- Service Worker fuente: [src/sw.js](src/sw.js). El SW final se genera en `dist/sw.js` durante el build.
- Manifest e íconos: [public/manifest.json](public/manifest.json), [public/icon-192x192.png](public/icon-192x192.png), [public/icon-512x512.png](public/icon-512x512.png).

## Despliegue

1. Compila:

```powershell
npm run build
```

2. Publica el contenido de `dist/` como sitio estático en el hosting adecuado

## Backend (resumen)

- La app requiere autenticación y consume endpoints de la API indicada por `VITE_API_BASE_URL`.
- Recuperación de contraseña depende de endpoints públicos del backend (`/forgot-password`, `/reset-password`).
