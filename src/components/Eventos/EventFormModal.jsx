import { useEffect, memo } from "react";
import { useForm } from "react-hook-form";
import "./EventFormModal.css";

function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  evento = null,
  tiposEventos = [],
  isLoading = false,
  fechaDefecto = null,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      tipo_evento_id: "",
      fecha: "",
      hora_inicio: "",
      lugar: "",
    },
  });
  useEffect(() => {
    if (!isOpen) return;

    if (evento) {
      const values = {
        nombre: evento.nombre || "",
        descripcion: evento.descripcion || "",
        tipo_evento_id: evento.tipo_evento_id || "",
        fecha: evento.fecha || "",
        hora_inicio: evento.hora || "",
        lugar: evento.lugar || "",
      };
      reset(values);
    } else {
      reset();
    }
  }, [evento, isOpen, reset]);
  useEffect(() => {
    if (!isOpen || evento || !fechaDefecto) return;

    const { year, month, day } = fechaDefecto;
    const fechaFormato = `${year}-${String(month + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    setValue("fecha", fechaFormato);
  }, [fechaDefecto, isOpen, evento, setValue]);
  const today = new Date().toISOString().split("T")[0];

  const onSubmitForm = (data) => {
    console.log("📤 Datos enviados al backend:", data);
    if (typeof onSubmit === "function") {
      onSubmit(data);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="event-form-modal-overlay">
      <div className="event-form-modal">
        <div className="event-form-header">
          <h2>{evento ? "Editar evento" : "Crear nuevo evento"}</h2>
          <button
            type="button"
            className="event-form-close"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="event-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del evento *</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Reunión General"
              {...register("nombre", {
                required: "El nombre es requerido",
                minLength: {
                  value: 3,
                  message: "Mínimo 3 caracteres",
                },
                maxLength: {
                  value: 150,
                  message: "Máximo 150 caracteres",
                },
              })}
              className={errors.nombre ? "input-error" : ""}
            />
            {errors.nombre && (
              <span className="error-text">{errors.nombre.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              placeholder="Describe los detalles del evento"
              maxLength={500}
              rows={3}
              {...register("descripcion", {
                required: "La descripción es requerida",
                maxLength: {
                  value: 500,
                  message: "Máximo 500 caracteres",
                },
              })}
              className={errors.descripcion ? "input-error" : ""}
            />
            {errors.descripcion && (
              <span className="error-text">{errors.descripcion.message}</span>
            )}
            <span className="char-count" id="desc-count">
              0/500
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="tipo_evento_id">Tipo de evento *</label>
            <select
              id="tipo_evento_id"
              {...register("tipo_evento_id", {
                required: "Selecciona un tipo de evento",
              })}
              className={errors.tipo_evento_id ? "input-error" : ""}
            >
              <option value="">-- Selecciona un tipo --</option>
              {tiposEventos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
            {errors.tipo_evento_id && (
              <span className="error-text">
                {errors.tipo_evento_id.message}
              </span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="fecha">Fecha *</label>
            <input
              id="fecha"
              type="date"
              min={today}
              {...register("fecha", {
                required: "La fecha es requerida",
              })}
              className={errors.fecha ? "input-error" : ""}
            />
            {errors.fecha && (
              <span className="error-text">{errors.fecha.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="hora_inicio">Hora *</label>
            <input
              id="hora_inicio"
              type="time"
              {...register("hora_inicio", {
                required: "La hora es requerida",
              })}
              className={errors.hora_inicio ? "input-error" : ""}
            />
            {errors.hora_inicio && (
              <span className="error-text">{errors.hora_inicio.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="lugar">Ubicación *</label>
            <input
              id="lugar"
              type="text"
              placeholder="Ej: Sala de conferencias A"
              {...register("lugar", {
                required: "La ubicación es requerida",
                maxLength: {
                  value: 150,
                  message: "Máximo 150 caracteres",
                },
              })}
              className={errors.lugar ? "input-error" : ""}
            />
            {errors.lugar && (
              <span className="error-text">{errors.lugar.message}</span>
            )}
          </div>
          <div className="event-form-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  {evento ? "Actualizando..." : "Creando..."}
                </>
              ) : evento ? (
                "Actualizar evento"
              ) : (
                "Crear evento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default memo(EventFormModal);
