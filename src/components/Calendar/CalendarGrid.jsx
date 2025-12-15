import React, { useMemo } from "react";
import "./CalendarGrid.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const toISO = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const weekdayUTC = (y, m, d) => new Date(Date.UTC(y, m, d)).getUTCDay();

function buildMonthMatrix(year, month) {
  const firstWeekday = weekdayUTC(year, month, 1);
  const mondayOffset = (firstWeekday + 6) % 7;

  const startDate = 1 - mondayOffset;
  const weeks = [];
  let day = startDate;

  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      const date = new Date(Date.UTC(year, month, day));
      row.push({
        y: date.getUTCFullYear(),
        m: date.getUTCMonth(),
        d: date.getUTCDate(),
      });
      day++;
    }
    weeks.push(row);
  }

  return weeks;
}

export default function CalendarGrid({
  year,
  month,
  selectedDate,
  today,
  eventsByDate = new Set(),
  onSelectDay,
  hideOutside = false,
  maxWeeks = 6,
}) {
  const weeks = useMemo(() => {
    const matrix = buildMonthMatrix(year, month);
    return maxWeeks < 6 ? matrix.slice(0, maxWeeks) : matrix;
  }, [year, month, maxWeeks]);

  const isSame = (a, b) => a && b && a.y === b.y && a.m === b.m && a.d === b.d;

  const renderCell = (cell) => {
    const iso = toISO(cell.y, cell.m, cell.d);
    const isOutside = cell.m !== month || cell.y !== year;
    const isToday = isSame(cell, today);
    const isSelected = isSame(cell, selectedDate);
    const hasEvent = eventsByDate.has(iso);

    if (hideOutside && isOutside) {
      return (
        <div
          key={iso}
          className="calendar-cell calendar-cell--empty"
          aria-hidden="true"
        />
      );
    }

    const classNames = [
      "calendar-cell",
      isOutside && "calendar-cell--outside",
      isToday && "calendar-cell--today",
      isSelected && "calendar-cell--selected",
      hasEvent && "calendar-cell--has-event",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        key={iso}
        className={classNames}
        onClick={() => onSelectDay && onSelectDay(cell)}
        aria-label={iso}
      >
        {cell.d}
      </button>
    );
  };

  return (
    <>
      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <div key={d} className="calendar-weekday">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-grid" style={{ "--weeks": maxWeeks }}>
        {weeks.flat().map(renderCell)}
      </div>
    </>
  );
}
