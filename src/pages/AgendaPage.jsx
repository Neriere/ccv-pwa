import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import {
  getCalendario,
  createEvento,
  updateEvento,
  deleteEvento,
  getTiposEventos,
} from "../services/eventoService";
import { formatFechaLocal } from "../utils/dateFormatters";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import AgendaEventCard from "../components/Agenda/AgendaEventCard";
import AgendaEventModal from "../components/Agenda/AgendaEventModal";
import AgendaToast from "../components/Agenda/AgendaToast";
import EventFormModal from "../components/Eventos/EventFormModal";
import DeleteEventDialog from "../components/Eventos/DeleteEventDialog";
import { useAssignments } from "../hooks/useAssignments";
import { AuthContext } from "../contexts/AuthContext";
import "./AgendaPage.css";

const MESES = Object.freeze([
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]);

const parseYMD = (yyyyMmDd) => {
  const [y, m, d] = (yyyyMmDd || "").split("-").map(Number);
  return { y, m: (m || 1) - 1, d: d || 1 };
};

const makeDateKey = (year, monthIndex, day) => {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayString = String(day).padStart(2, "0");
  return `${year}-${month}-${dayString}`;
};

const buildEventIndexes = (list) => {
  const byDate = new Map();
  const byMonth = new Map();
  const dateSet = new Set();

  (list || []).forEach((evento) => {
    const dateKey = (evento?.fecha || "").slice(0, 10);
    if (!dateKey) {
      return;
    }

    dateSet.add(dateKey);

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey).push(evento);

    const { y, m } = parseYMD(evento.fecha);
    const monthKey = `${y}-${m}`;
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, []);
    }
    byMonth.get(monthKey).push(evento);
  });

  return { byDate, byMonth, dateSet };
};

const buildToday = () => {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
};

export default function AgendaPage() {
  const hoy = useMemo(() => buildToday(), []);

  const [mesActual, setMesActual] = useState(hoy.m);
  const [anioActual, setAnioActual] = useState(hoy.y);
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoy.d);
  const [eventoActivo, setEventoActivo] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEventFormModal, setShowEventFormModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [tiposEventos, setTiposEventos] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const { canManageEvents, user, isAdmin, isLider } = useContext(AuthContext);
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("📋 AGENDA DEBUG:", {
        user,
        isAdmin: isAdmin?.(),
        isLider: isLider?.(),
        canManageEvents: canManageEvents?.(),
      });
    }
  }, [user, isAdmin, isLider, canManageEvents]);

  const {
    assignments: misAsignaciones,
    toast,
    dismissToast,
    error: misAsignacionesError,
  } = useAssignments();

  const derivedAsignaciones = useMemo(() => {
    if (!misAsignacionesError) {
      return [];
    }

    const userId = user?.id;
    if (!userId) {
      return [];
    }

    const result = [];
    for (const evento of eventos || []) {
      const rawList =
        evento?.user_evento_funciones ||
        evento?.userEventoFunciones ||
        evento?.asignaciones ||
        [];
      if (!Array.isArray(rawList) || rawList.length === 0) {
        continue;
      }

      for (const raw of rawList) {
        const rawUserId = raw?.user_id || raw?.usuario?.id;
        if (rawUserId !== userId) {
          continue;
        }

        result.push({
          ...raw,
          id: raw?.id || `${evento?.id || "evento"}-${raw?.funcion_id || "f"}`,
          evento_id: raw?.evento_id || evento?.id,
          evento,
          funcion: raw?.funcion || raw?.funcion,
        });
      }
    }

    return result;
  }, [misAsignacionesError, user?.id, eventos]);

  const assignmentsForUi = useMemo(() => {
    if (Array.isArray(misAsignaciones) && misAsignaciones.length > 0) {
      return misAsignaciones;
    }
    return derivedAsignaciones;
  }, [misAsignaciones, derivedAsignaciones]);

  const loadEventos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCalendario({
        year: anioActual,
        month: mesActual + 1,
      });

      let eventos = data?.eventos || data?.events || data?.data || [];
      if (
        eventos.length > 0 &&
        !eventos[0]?.tipoEvento &&
        tiposEventos.length > 0
      ) {
        eventos = eventos.map((evento) => ({
          ...evento,
          tipoEvento:
            tiposEventos.find((t) => t.id === evento.tipoevento_id) ||
            evento.tipoEvento,
        }));
      }

      setEventos(eventos);
    } catch (err) {
      console.error("Error cargando eventos:", err);
      setError("Error al cargar eventos. ");
    } finally {
      setLoading(false);
    }
  }, [anioActual, mesActual, tiposEventos]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const data = await getTiposEventos();
        setTiposEventos(
          Array.isArray(data) ? data : data?.data || data?.tipos || []
        );
      } catch (err) {
        console.error("Error al cargar tipos de eventos:", err);
      }
    };
    cargarTipos();
  }, []);
  const handleSaveEvento = useCallback(
    async (formData) => {
      setFormLoading(true);
      setFormError("");

      try {
        // Mapear campos del formulario a lo que espera el backend
        const dataWithUser = {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          tipoevento_id: parseInt(formData.tipo_evento_id, 10),
          fecha: formData.fecha,
          hora: formData.hora_inicio, // El backend solo acepta "hora"
          lugar: formData.lugar,
          propietario_id: user?.id,
          estado: true, // Por defecto, eventos nuevos/editados están activos
        };

        console.log("📤 Enviando evento:", dataWithUser);
        console.log("📋 Campos enviados:", Object.keys(dataWithUser));

        if (eventoEditar?.id) {
          // Editar - preservar el estado actual si existe
          dataWithUser.estado = eventoEditar?.estado ?? true;
          console.log(
            "🔄 Actualizando evento ID:",
            eventoEditar.id,
            "Estado:",
            dataWithUser.estado
          );
          await updateEvento(eventoEditar.id, dataWithUser);
        } else {
          // Crear - nuevo evento activo por defecto
          console.log("✨ Creando nuevo evento");
          await createEvento(dataWithUser);
        }

        console.log("✅ Evento guardado exitosamente");
        setShowEventFormModal(false);
        setEventoEditar(null);
        try {
          await loadEventos();
          console.log("✅ Eventos recargados");
        } catch (reloadErr) {
          console.warn(
            "⚠️ Error al recargar eventos, pero el evento se guardó:",
            reloadErr
          );
        }
      } catch (err) {
        console.error("Error al guardar evento:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al guardar el evento. Intenta nuevamente.";

        console.error("📋 Detalles del error:", err.response?.data);
        setFormError(errorMessage);
      } finally {
        setFormLoading(false);
      }
    },
    [eventoEditar, loadEventos, user]
  );
  const handleDeleteEvento = useCallback(async () => {
    if (!eventoEditar?.id) return;

    setFormLoading(true);
    setFormError("");

    try {
      await deleteEvento(eventoEditar.id);
      console.log(
        "✅ Evento eliminado exitosamente (o eliminado en servidor, espera confirmación)"
      );
      setShowDeleteDialog(false);
      setEventoEditar(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await loadEventos();
        console.log("✅ Eventos recargados - eliminación confirmada");
      } catch (reloadErr) {
        console.warn(
          "⚠️ Error al recargar eventos después de eliminación:",
          reloadErr
        );
        alert(
          "✅ Evento eliminado exitosamente.\n\n" +
            "Se está recargando la lista. Si el evento sigue apareciendo, " +
            "intenta actualizar la página manualmente (F5)."
        );
      }
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      let errorMsg = "Error al eliminar el evento. Intenta nuevamente.";

      if (err.message?.includes("CORS")) {
        errorMsg =
          "⚠️ Error de conexión (CORS). Es un problema del servidor.\n\n" +
          "El evento PODRÍA haber sido eliminado en el servidor. " +
          "Recarga la página para verificar.";
      } else if (err.message?.includes("Failed to fetch")) {
        errorMsg =
          "⚠️ Error de conexión con el servidor.\n\n" +
          "El evento PODRÍA haber sido eliminado. " +
          "Recarga la página (F5) para verificar.";
      } else if (err.message?.includes("status: 0")) {
        errorMsg =
          "⚠️ Error de conexión.\n\n" +
          "El evento PODRÍA haber sido eliminado. " +
          "Recarga la página (F5) para verificar.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }

      setFormError(errorMsg);
    } finally {
      setFormLoading(false);
    }
  }, [eventoEditar, loadEventos]);
  const handleOpenCreateModal = useCallback(() => {
    setEventoEditar(null);
    setFormError("");
    setShowEventFormModal(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setShowEventFormModal(false);
    setEventoEditar(null);
    setFormError("");
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  const indexes = useMemo(() => buildEventIndexes(eventos), [eventos]);
  const selectedDateKey = useMemo(
    () => makeDateKey(anioActual, mesActual, diaSeleccionado),
    [anioActual, mesActual, diaSeleccionado]
  );
  const selectedMonthKey = useMemo(
    () => `${anioActual}-${mesActual}`,
    [anioActual, mesActual]
  );

  const eventosDelDia = useMemo(
    () => indexes.byDate.get(selectedDateKey) || [],
    [indexes, selectedDateKey]
  );

  const eventosDelMes = useMemo(
    () => indexes.byMonth.get(selectedMonthKey) || [],
    [indexes, selectedMonthKey]
  );

  const asignacionesPorEvento = useMemo(() => {
    const map = new Map();
    for (const assignment of assignmentsForUi || []) {
      const eventId = assignment?.evento_id || assignment?.evento?.id;
      if (!eventId) {
        continue;
      }
      if (!map.has(eventId)) {
        map.set(eventId, []);
      }
      map.get(eventId).push(assignment);
    }
    return map;
  }, [assignmentsForUi]);

  const cambiarMes = (delta) => {
    let nuevoMes = mesActual + delta;
    let nuevoAnio = anioActual;

    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    }

    setMesActual(nuevoMes);
    setAnioActual(nuevoAnio);
    const maxDia = new Date(nuevoAnio, nuevoMes + 1, 0).getDate();
    setDiaSeleccionado((prev) => Math.min(prev, maxDia));
    setEventoActivo(null);
  };

  const handleSelectDay = useCallback((cell) => {
    if (!cell) {
      return;
    }
    setAnioActual(cell.y);
    setMesActual(cell.m);
    setDiaSeleccionado(cell.d);
    setEventoActivo(null);
  }, []);

  const openEvento = useCallback((evento) => {
    if (!evento) {
      return;
    }
    setEventoActivo({
      ...evento,
      fechaFormatted: formatFechaLocal(evento.fecha),
    });
  }, []);

  const closeEvento = useCallback(() => setEventoActivo(null), []);

  const sortedAssignments = useMemo(() => {
    const eventMap = new Map();

    for (const assignment of assignmentsForUi || []) {
      const eventId = assignment?.evento_id || assignment?.evento?.id;
      if (!eventId) continue;

      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          evento: assignment.evento,
          asignaciones: [],
        });
      }
      eventMap.get(eventId).asignaciones.push(assignment);
    }

    return Array.from(eventMap.values())
      .sort(
        (a, b) =>
          new Date(a?.evento?.fecha || "2100-01-01") -
          new Date(b?.evento?.fecha || "2100-01-01")
      )
      .slice(0, 3);
  }, [assignmentsForUi]);

  return (
    <div className="agenda-page">
      <h1 className="agenda-title">Agenda</h1>
      {canManageEvents?.() && (
        <button
          type="button"
          className="agenda-fab"
          onClick={handleOpenCreateModal}
          title="Crear nuevo evento"
          aria-label="Crear nuevo evento"
        >
          ➕
        </button>
      )}

      {error && <div className="agenda-error">ℹ️ {error}</div>}

      <div className="agenda-card">
        <div className="agenda-card-header">
          <button
            type="button"
            className="agenda-card-button"
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
          >
            ‹
          </button>

          <div className="agenda-month">
            <div className="agenda-month-title">
              {MESES[mesActual]} {anioActual}
            </div>
            <div className="agenda-month-subtitle">
              {eventosDelMes.length}{" "}
              {eventosDelMes.length === 1 ? "evento" : "eventos"}
            </div>
          </div>

          <button
            type="button"
            className="agenda-card-button"
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
          >
            ›
          </button>
        </div>

        <CalendarGrid
          year={anioActual}
          month={mesActual}
          selectedDate={{ y: anioActual, m: mesActual, d: diaSeleccionado }}
          today={hoy}
          eventsByDate={indexes.dateSet}
          onSelectDay={handleSelectDay}
          hideOutside
          maxWeeks={5}
        />
      </div>

      <AgendaToast toast={toast} onDismiss={dismissToast} />

      <section className="agenda-section">
        <h2 className="agenda-section-title">
          <span>📅</span>
          Eventos del {diaSeleccionado} de {MESES[mesActual]}
        </h2>

        {eventosDelDia.length === 0 ? (
          <div className="agenda-empty">
            <div className="agenda-empty-icon">📭</div>
            <p>No hay eventos para este día</p>
          </div>
        ) : (
          <div className="agenda-list">
            {eventosDelDia.map((evento) => (
              <AgendaEventCard
                key={evento.id}
                evento={evento}
                asignaciones={asignacionesPorEvento.get(evento.id) || []}
                onSelect={openEvento}
              />
            ))}
          </div>
        )}
      </section>

      <section className="agenda-section">
        <h2 className="agenda-section-title">
          <span>🧩</span>
          Mis asignaciones próximas
        </h2>

        {sortedAssignments.length === 0 ? (
          <div className="agenda-empty">
            <p>
              {misAsignacionesError
                ? "No se pudieron cargar tus asignaciones (error del servidor)."
                : "Aún no tienes asignaciones."}
            </p>
          </div>
        ) : (
          <div className="agenda-assignments-list">
            {sortedAssignments.map((eventGroup) => (
              <div key={eventGroup.evento.id} className="evento-asignaciones">
                <div className="evento-header">
                  <span className="evento-nombre">
                    {eventGroup?.evento?.nombre || "Evento"}
                  </span>
                  <span className="evento-fecha">
                    {eventGroup?.evento?.fecha
                      ? formatFechaLocal(eventGroup?.evento?.fecha)
                      : "Fecha por definir"}
                  </span>
                </div>

                <div className="funciones-list">
                  {eventGroup?.evento?.hora && (
                    <div className="evento-hora">
                      🕐 {eventGroup?.evento?.hora}
                    </div>
                  )}
                  {eventGroup?.asignaciones?.map((assignment) => (
                    <div key={assignment.id} className="funcion-item">
                      • {assignment?.funcion?.nombre || "Función"}
                    </div>
                  ))}
                </div>

                {eventGroup?.evento?.lugar && (
                  <div className="evento-lugar">
                    📍 {eventGroup?.evento?.lugar}
                  </div>
                )}
                {canManageEvents?.() && (
                  <div className="evento-acciones">
                    <button
                      type="button"
                      className="btn-editar"
                      onClick={() => {
                        setEventoEditar(eventGroup?.evento);
                        setShowEventFormModal(true);
                      }}
                      title="Editar evento"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      className="btn-eliminar"
                      onClick={() => {
                        setEventoEditar(eventGroup?.evento);
                        setShowDeleteDialog(true);
                      }}
                      title="Eliminar evento"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="agenda-section">
        <h2 className="agenda-section-title">
          <span>🗓️</span>
          Todos los eventos de {MESES[mesActual]}
        </h2>

        {loading ? (
          <div className="agenda-spinner" />
        ) : eventosDelMes.length === 0 ? (
          <div className="agenda-empty">
            <div className="agenda-empty-icon">📭</div>
            <p>No hay eventos para este mes</p>
          </div>
        ) : (
          <div className="agenda-list" style={{ maxHeight: "300px" }}>
            {eventosDelMes.map((evento) => (
              <div key={evento.id} className="evento-list-item">
                <AgendaEventCard
                  evento={evento}
                  onSelect={openEvento}
                  variant="month"
                />
                {canManageEvents?.() && (
                  <div className="evento-list-acciones">
                    <button
                      type="button"
                      className="btn-editar-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventoEditar(evento);
                        setShowEventFormModal(true);
                      }}
                      title="Editar evento"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-eliminar-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventoEditar(evento);
                        setShowDeleteDialog(true);
                      }}
                      title="Eliminar evento"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <AgendaEventModal evento={eventoActivo} onClose={closeEvento} />
      <EventFormModal
        isOpen={showEventFormModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveEvento}
        evento={eventoEditar}
        tiposEventos={tiposEventos}
        isLoading={formLoading}
        fechaDefecto={{
          year: anioActual,
          month: mesActual,
          day: diaSeleccionado,
        }}
      />

      {formError && (
        <div className="agenda-error" style={{ marginTop: "16px" }}>
          ⚠️ {formError}
        </div>
      )}
      <DeleteEventDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteEvento}
        evento={eventoEditar}
        isLoading={formLoading}
      />
    </div>
  );
}
