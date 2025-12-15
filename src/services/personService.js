import api from "./apiService";

export async function listPersons(params = {}) {
  const payload = await api.get("/personas", params);
  // Soportar distintas formas de respuesta: array directo, {data: []}, {personas: []}
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.personas)) return payload.personas;
  // Paginado Laravel: { data: { data: [], total, ... } }
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

// Mapa de roles según (RolUsuarioSeeder/DatabaseSeeder)
const ROLE_ID_TO_NAME = {
  1: "Administrador", // Administrador
  2: "Colaborador", // Colaborador
  3: "Líder", // Líder
  4: "Inactivo", // inactivo / restringido
};

function coerceInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

// Normaliza un item (Member + User) a una forma fija
function normalizePersona(item) {
  if (!item) return null;
  const user = item.user || item.usuario || {};
  const member = item; // en /personas viene como Member con 'user'
  const roleId = user.roluser_id ?? user.role_id ?? user.roluserId;
  const roleNameSeed =
    ROLE_ID_TO_NAME[coerceInt(roleId)] || user?.rolUsuario?.nombre || undefined;
  return {
    id: user.id ?? member.id,
    firstName: member.nombre || user.name || "",
    lastNamePaterno: member.apellidoPaterno || "",
    lastNameMaterno: member.apellidoMaterno || "",
    email: user.email || "",
    phone: member.numero || member.telefono || "",
    sexo: member.sexo || "",
    direccion: member.direccion || "",
    ciudad: member.ciudad || "",
    roleId: coerceInt(roleId),
    roleName: roleNameSeed,
    raw: item,
  };
}

let cachedPersons = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export async function listPersonsNormalized(params = {}) {
  const now = Date.now();
  // Solo cachea si no hay params (filtro) y el cache está vigente
  const isDefault = !params || Object.keys(params).length === 0;
  if (isDefault && cachedPersons && now - cacheTimestamp < CACHE_DURATION) {
    return cachedPersons;
  }
  const list = await listPersons(params);
  if (!Array.isArray(list)) return [];
  const normalized = list.map(normalizePersona).filter(Boolean);
  if (isDefault) {
    cachedPersons = normalized;
    cacheTimestamp = now;
  }
  return normalized;
}

export function invalidatePersonsCache() {
  cachedPersons = null;
  cacheTimestamp = 0;
}
