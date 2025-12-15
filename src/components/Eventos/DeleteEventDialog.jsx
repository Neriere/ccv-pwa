import "./DeleteEventDialog.css";

export default function DeleteEventDialog({
  isOpen,
  onClose,
  onConfirm,
  evento = null,
  isLoading = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="delete-dialog-overlay">
      <div className="delete-dialog">
        <div className="delete-dialog-icon">⚠️</div>

        <h2>¿Eliminar evento?</h2>

        <p className="delete-dialog-message">
          {evento?.nombre ? (
            <>
              Está a punto de eliminar el evento{" "}
              <strong>"{evento.nombre}"</strong>.
              <br />
              Esta acción <strong>no se puede deshacer</strong>.
            </>
          ) : (
            "Esta acción no se puede deshacer."
          )}
        </p>

        <div className="delete-dialog-buttons">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Eliminando...
              </>
            ) : (
              "Eliminar evento"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
