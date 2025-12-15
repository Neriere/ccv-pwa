import { formatHora } from "../../utils/dateFormatters";
import "./AgendaEventModal.css";

export default function AgendaEventModal({ evento, onClose }) {
  if (!evento) {
    return null;
  }

  const tipo = evento.tipoEvento?.tipo || "Evento";

  return (
    <div className="agenda-modal" onClick={onClose}>
      <div
        className="agenda-modal__dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="agenda-modal__header">
          <span className="agenda-modal__badge">{tipo}</span>
          <button
            type="button"
            className="agenda-modal__close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <h3 className="agenda-modal__title">{evento.nombre}</h3>

        <div className="agenda-modal__content">
          <ModalRow icon="🏷️" label="Tipo de Evento" value={tipo} />
          <ModalRow icon="📆" label="Fecha" value={evento.fechaFormatted} />
          <ModalRow icon="🕐" label="Hora" value={formatHora(evento.hora)} />
          <ModalRow icon="📍" label="Lugar" value={evento.lugar} />

          {evento.descripcion && (
            <div className="agenda-modal__description">
              <span className="agenda-modal__description-label">
                Descripción
              </span>
              <p className="agenda-modal__description-text">
                {evento.descripcion}
              </p>
            </div>
          )}

          {evento.creador && (
            <ModalRow
              icon="👤"
              label="Creado por"
              value={evento.creador.name}
            />
          )}
        </div>

        <button
          type="button"
          className="agenda-modal__action"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ModalRow({ icon, label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="agenda-modal__row">
      <span className="agenda-modal__row-icon">{icon}</span>
      <div>
        <span className="agenda-modal__row-label">{label}</span>
        <div className="agenda-modal__row-value">{value}</div>
      </div>
    </div>
  );
}
