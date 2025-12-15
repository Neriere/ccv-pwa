import React, { useEffect, useMemo, useState } from "react";
import { listPersonsNormalized } from "../services/personService";

// Sin heurísticas aquí; los datos vienen normalizados desde el servicio

const DEFAULT_ROLE_OPTION = "Todos";

export default function UsuariosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("Todos");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seleccionado, setSeleccionado] = useState(null);

  // Construye opciones de rol a partir de los datos reales
  const roleOptions = useMemo(() => {
    const set = new Set();
    for (const u of usuarios || []) {
      if (u.roleName && u.roleName !== "inactivo") set.add(u.roleName);
    }
    return [DEFAULT_ROLE_OPTION, ...Array.from(set).sort()];
  }, [usuarios]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listPersonsNormalized();
        setUsuarios(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error al cargar usuarios", e);
        setError(e?.message || "No se pudo cargar usuarios");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if ((!q && filtroRol === DEFAULT_ROLE_OPTION) || !usuarios) {
      return usuarios || [];
    }
    return (usuarios || []).filter((u) => {
      // Early return para optimizar filtro rol (más frecuente)
      const rolNorm = (u.roleName || "").toLowerCase();
      const matchRol =
        filtroRol === DEFAULT_ROLE_OPTION ||
        rolNorm === filtroRol.toLowerCase();
      if (!matchRol) return false; // Skip text matching

      if (!q) return true;

      // Texto matching solo si rol coincide
      const first = (u.firstName || "").toLowerCase();
      const apePat = (u.lastNamePaterno || "").toLowerCase();
      const apeMat = (u.lastNameMaterno || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return (
        first.includes(q) ||
        apePat.includes(q) ||
        apeMat.includes(q) ||
        email.includes(q)
      );
    });
  }, [usuarios, busqueda, filtroRol]);

  return (
    <div style={{ padding: "16px", maxWidth: "520px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "1.8rem",
          fontWeight: 700,
          marginBottom: 12,
          color: "var(--text-primary)",
        }}
      >
        Usuarios
      </h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Buscar nombre o apellidos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
          }}
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#fff",
            color: "#000000ff",
          }}
        >
          {roleOptions.map((r) => (
            <option key={r} value={r} style={{ color: "#0b1220" }}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <span>Cargando usuarios...</span>
        </div>
      )}

      {error && !loading && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            color: "#92400e",
            borderRadius: 12,
            padding: 10,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {!loading && usuariosFiltrados.length === 0 && !error && (
        <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>
          No se encontraron usuarios.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {usuariosFiltrados.map((u) => {
          const nombre = u.firstName || "(Sin nombre)";
          const email = u.email || "—";
          const rol = u.roleName || "—";
          const telefono = u.phone || "—";
          const sexo = u.sexo || "—";
          const apePat = u.lastNamePaterno || "";
          const apeMat = u.lastNameMaterno || "";
          return (
            <button
              key={u.id || u.email}
              onClick={() => setSeleccionado(u)}
              style={{
                textAlign: "left",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 12,
                boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "baseline",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#0b1220",
                      fontWeight: 800,
                      fontSize: 16,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {[nombre, apePat, apeMat].filter(Boolean).join(" ")}
                  </span>
                </div>
                <span
                  style={{
                    background: "#e3f2fd",
                    color: "#143a5a",
                    borderRadius: 8,
                    padding: "2px 8px",
                    fontSize: 12,
                  }}
                >
                  {rol}
                </span>
              </div>
              <div style={{ color: "#334155", fontSize: 14 }}>📧 {email}</div>
              <div style={{ color: "#334155", fontSize: 14 }}>
                📞 {telefono}
              </div>
              <div style={{ color: "#334155", fontSize: 14 }}>
                ⚧ Sexo: {sexo}
              </div>
            </button>
          );
        })}
      </div>

      {seleccionado && (
        <div
          onClick={() => setSeleccionado(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              width: "100%",
              maxWidth: 420,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "baseline",
                  flex: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    margin: 0,
                    color: "#0b1220",
                    fontWeight: 800,
                    fontSize: 18,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {[
                    seleccionado.firstName ||
                      seleccionado.nombre ||
                      seleccionado.name,
                    seleccionado.lastNamePaterno,
                    seleccionado.lastNameMaterno,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </div>
              <button
                aria-label="Cerrar"
                onClick={() => setSeleccionado(null)}
                style={{
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                color: "#334155",
                fontSize: 14,
                display: "grid",
                gap: 6,
              }}
            >
              <div>📧 {seleccionado.email || "—"}</div>
              <div>📞 {seleccionado.phone || "—"}</div>
              <div>⚧ Sexo: {seleccionado.sexo || "—"}</div>
              <div>👤 Rol: {seleccionado.roleName || "—"}</div>
              {seleccionado.rut && <div>🪪 RUT: {seleccionado.rut}</div>}
              {seleccionado.direccion && (
                <div>🏠 Dirección: {seleccionado.direccion}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
