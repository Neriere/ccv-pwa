import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAsignacionesPorUsuario,
  getMisAsignaciones,
} from "../services/asignacionService";
import { getLocalNotificationsEnabled } from "../services/notificationSettingsService";
import { getStoredToken, getStoredUser } from "../services/sessionStorage";

const STORAGE_KEY = "mis_asig_ids";
const HOUR_IN_MS = 60 * 60 * 1000;
const MIN_DELAY = 5 * 60 * 1000;
const MAX_DELAY = 24 * HOUR_IN_MS;
const TOAST_DURATION_MS = 5000;

export function useAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const timersRef = useRef([]);
  const toastTimerRef = useRef(null);

  const cleanupTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const scheduleReminders = useCallback(
    (list) => {
      cleanupTimers();

      let notificationsEnabled = true;
      try {
        notificationsEnabled = getLocalNotificationsEnabled();
      } catch {
        notificationsEnabled = true;
      }

      if (!notificationsEnabled) {
        return;
      }

      const now = Date.now();

      for (const assignment of list || []) {
        const fecha = assignment?.evento?.fecha;
        const hora = assignment?.evento?.hora || "09:00";
        if (!fecha) {
          continue;
        }

        const [year, month, day] = fecha.split("-").map(Number);
        const [hour, minute] = (hora || "09:00").split(":").map(Number);
        const eventTime = new Date(
          year,
          (month || 1) - 1,
          day || 1,
          hour || 9,
          minute || 0
        ).getTime();
        const reminderAt = eventTime - HOUR_IN_MS;
        const delta = reminderAt - now;

        if (delta > MIN_DELAY && delta < MAX_DELAY) {
          const id = setTimeout(() => {
            setToast({
              type: "reminder",
              text: `Recordatorio: ${
                assignment?.evento?.nombre || "Evento"
              } en 1 hora.`,
            });

            clearToastTimer();
            toastTimerRef.current = setTimeout(
              () => setToast(null),
              TOAST_DURATION_MS
            );

            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification("Recordatorio de evento", {
                  body: `${assignment?.evento?.nombre || "Evento"}`,
                });
              } catch (error) {
                if (import.meta.env.DEV) {
                  console.debug("Notification error:", error);
                }
              }
            }
          }, delta);

          timersRef.current.push(id);
        }
      }
    },
    [cleanupTimers, clearToastTimer]
  );

  useEffect(() => {
    let isCancelled = false;

    const fetchAssignments = async () => {
      try {
        const token = getStoredToken();
        if (!token) {
          if (import.meta.env.DEV) {
            console.debug(
              "useAssignments: sin token, no se cargan asignaciones"
            );
          }
          setAssignments([]);
          setError(null);
          return;
        }

        let notificationsEnabled = true;
        try {
          notificationsEnabled = getLocalNotificationsEnabled();
        } catch {
          notificationsEnabled = true;
        }

        let response = null;
        let list = [];

        try {
          response = await getMisAsignaciones();
          list = Array.isArray(response)
            ? response
            : response?.data || response?.asignaciones || [];
        } catch (error) {
          const status = error?.status;

          if (import.meta.env.DEV) {
            console.debug("useAssignments: fallo getMisAsignaciones", {
              status,
              message: error?.message,
            });
          }

          // Fallback: algunos despliegues pueden no tener /mis-asignaciones
          // o pueden fallar por middleware. Intentar por filtro user_id.
          const storedUser = getStoredUser();
          if (storedUser?.id) {
            const fallbackResponse = await getAsignacionesPorUsuario(
              storedUser.id
            );
            list = Array.isArray(fallbackResponse)
              ? fallbackResponse
              : fallbackResponse?.data || fallbackResponse?.asignaciones || [];
          } else {
            throw error;
          }
        }

        if (isCancelled) {
          return;
        }

        setAssignments(list);
        setError(null);

        const previousIds = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || "[]"
        );
        const previousSet = new Set(previousIds);
        const currentIds = list.map((item) => item?.id).filter(Boolean);
        const newIds = currentIds.filter((id) => !previousSet.has(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentIds));

        if (notificationsEnabled && newIds.length > 0) {
          setToast({
            type: "info",
            text: `Tienes ${newIds.length} nueva(s) asignación(es).`,
          });

          clearToastTimer();
          toastTimerRef.current = setTimeout(() => setToast(null), 4000);

          if (typeof window !== "undefined" && "Notification" in window) {
            const notifyNewAssignments = () => {
              list
                .filter((item) => newIds.includes(item?.id))
                .forEach((assignment) => {
                  const title = "Nueva asignación";
                  const body = `${assignment?.evento?.nombre || "Evento"}`;
                  try {
                    new Notification(title, { body });
                  } catch {
                    /* ignore */
                  }
                });
            };

            if (Notification.permission === "default") {
              Notification.requestPermission().then((status) => {
                if (status === "granted") {
                  notifyNewAssignments();
                }
              });
            } else if (Notification.permission === "granted") {
              notifyNewAssignments();
            }
          }
        }

        scheduleReminders(list);
      } catch (error) {
        const message = error?.message || "No se pudieron cargar asignaciones";
        console.warn("No se pudieron cargar mis asignaciones:", message);
        setAssignments([]);
        setError(message);
      }
    };

    fetchAssignments();

    return () => {
      isCancelled = true;
      cleanupTimers();
      clearToastTimer();
    };
  }, [cleanupTimers, clearToastTimer, scheduleReminders, refreshKey]);

  useEffect(() => {
    const bump = () => setRefreshKey((prev) => prev + 1);

    const onStorage = (event) => {
      if (event?.key === "auth_token") {
        bump();
      }
    };

    // Reintentar carga al refrescar token o cambiar sesión.
    window.addEventListener("auth:token-refreshed", bump);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("auth:token-refreshed", bump);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const dismissToast = useCallback(() => {
    clearToastTimer();
    setToast(null);
  }, [clearToastTimer]);

  return {
    assignments,
    toast,
    dismissToast,
    error,
  };
}
