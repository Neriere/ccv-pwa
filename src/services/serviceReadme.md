# Servicios disponibles

Este directorio reune los clientes HTTP utilizados por la aplicación. Cada módulo expone funciones puras que encapsulan la llamada a la API y devuelven los datos ya normalizados. Todas las peticiones utilizan la URL base definida en la variable de entorno VITE_API_BASE_URL.

Cuando añadas un nuevo archivo de servicio actualiza también este documento para mantener la referencia al día.

## Tabla resumen

| Servicio          | Funciones exportadas  | Descripción breve                                                           |
| ----------------- | --------------------- | --------------------------------------------------------------------------- |
| authService       | login, logout,        |
| asignacionService | getMisAsignaciones    | Obtiene la lista de asignaciones vigentes para el usuario actual.           |
| dashboardService  | getDashboard          | Carga los contadores y tarjetas del dashboard principal.                    |
| eventoService     | getCalendario         | Recupera los eventos del calendario del usuario autenticado.                |
| personService     | listPersonsNormalized | Devuelve la lista de personas en un formato plano apto para selects/tablas. |

## Gu�a de uso

### Configuraci�n de Axios

`js
// src/services/httpClient.js
import axios from "axios";

export const httpClient = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL,
withCredentials: true,
});
`

Todos los servicios reutilizan httpClient para compartir interceptores y cabeceras comunes.

### Ejemplos

#### Iniciar sesi�n

`js
import { login } from "@/services/authService";

async function handleSubmit(credentials) {
const user = await login(credentials);
// Persistir al usuario en el contexto o estado global
}
`

#### Cargar dashboard

`js
import { getDashboard } from "@/services/dashboardService";

export async function loader() {
const data = await getDashboard();
return { data };
}
`

## Buenas pr�cticas

- **Reutiliza httpClient** para no duplicar configuración ni interceptores.
- **Retorna datos normalizados**: oculta la forma exacta del backend y deja al componente recibir estructuras listas para renderizar.
- **Propaga errores** con hrow para que TanStack Query u otros consumidores puedan gestionar estados de fallo.
- **Escribe pruebas unitarias** cuando a�adas l�gica de transformaci�n compleja.
- **Actualiza esta gu�a** cada vez que surja un nuevo servicio o se modifique la superficie p�blica de alguno existente.
