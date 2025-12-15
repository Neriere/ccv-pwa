function safeStringify(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message || String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default function ErrorFallback({ error, onReset }) {
  const detail = error?.message || safeStringify(error);
  let lastError = null;
  try {
    const raw = window?.localStorage?.getItem("pwa_last_error");
    lastError = raw ? JSON.parse(raw) : null;
  } catch {
    lastError = null;
  }

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <h2>Ha ocurrido un error inesperado</h2>
      <p>Por favor, recarga la página o contacta soporte.</p>

      {detail && (
        <p style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12 }}>
          Detalle: {detail}
        </p>
      )}

      {!detail && lastError?.message && (
        <p style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12 }}>
          Detalle (guardado): {lastError.message}
        </p>
      )}

      {lastError?.time && (
        <p style={{ marginTop: 8, color: "#666", fontSize: 12 }}>
          Último error: {new Date(lastError.time).toLocaleString()}
        </p>
      )}

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {typeof onReset === "function" && (
          <button
            type="button"
            onClick={onReset}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        )}

        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: "white",
            cursor: "pointer",
          }}
        >
          Recargar
        </button>
      </div>
    </div>
  );
}
