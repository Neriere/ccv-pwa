import { memo } from "react";
import { formatHora } from "../../utils/dateFormatters";
import "./AgendaEventCard.css";

function AgendaEventCard({
  evento,
  asignaciones = [],
  onSelect,
  variant = "day",
}) {
  if (!evento) {
    return null;
  }

  const tipo = evento.tipoEvento?.tipo || "Evento";
  const fecha = evento.fecha;
  const hora = formatHora(evento.hora);
  const lugar = evento.lugar;

  const handleClick = () => {
    if (typeof onSelect === "function") {
      onSelect(evento);
    }
  };

  const cardClass = `agenda-event-card agenda-event-card--${variant}`;

  return (
    <button type="button" className={cardClass} onClick={handleClick}>
      <div className="agenda-event-card__header">
        <span className="agenda-event-card__title">{evento.nombre}</span>
        <span className="agenda-event-card__badge">{tipo}</span>
      </div>

      {variant === "day" && asignaciones.length > 0 && (
        <div className="agenda-event-card__assignments">
          {asignaciones.map((asignacion) => (
            <span key={asignacion.id} className="agenda-event-card__assignment">
              {asignacion?.funcion?.nombre || "—"}
            </span>
          ))}
        </div>
      )}

      <div className="agenda-event-card__meta">
        {hora && (
          <span className="agenda-event-card__meta-item">🕐 {hora}</span>
        )}
        {lugar && (
          <span className="agenda-event-card__meta-item">📍 {lugar}</span>
        )}
        {!hora && !lugar && fecha && (
          <span className="agenda-event-card__meta-item">📆 {fecha}</span>
        )}
      </div>
    </button>
  );
}

export default memo(AgendaEventCard);
