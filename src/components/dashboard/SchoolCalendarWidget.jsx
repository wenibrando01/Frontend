import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../services/api";

const ENDPOINTS = ["/admin/school-days", "/school-days", "/attendance"];
const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeRows(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || [];
  return rows
    .map((row) => ({
      date: String(row.date || ""),
      isHoliday: Boolean(row.is_holiday),
      attendance: Number(row.attendance_rate ?? 0),
      description: row.description ? String(row.description) : "",
    }))
    .filter((row) => row.date);
}

function buildMonthCells(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push({
      date: d,
      inMonth: d.getMonth() === month,
    });
  }
  return cells;
}

const SchoolCalendarWidget = () => {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [daysMap, setDaysMap] = useState({});
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDays = async () => {
      setLoading(true);
      setError("");

      try {
        let lastError = null;
        for (const endpoint of ENDPOINTS) {
          try {
            const res = await api.get(endpoint, {
              params: { per_page: 500 },
              retry: { retries: 3 },
            });
            const rows = normalizeRows(res.data);
            if (!rows.length) continue;

            const map = {};
            rows.forEach((row) => {
              map[row.date] = {
                isHoliday: row.isHoliday,
                attendance: row.attendance,
                description: row.description,
              };
            });
            setDaysMap(map);
            if (!selectedKey) {
              const today = dateKey(new Date());
              setSelectedKey(today);
            }
            return;
          } catch (err) {
            const status = err?.response?.status;
            if (status === 401) throw err;
            if (status === 403 || status === 404) {
              lastError = err;
              continue;
            }
            throw err;
          }
        }

        throw lastError || new Error("No calendar data endpoint available.");
      } catch (err) {
        if (err?.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Calendar unavailable.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDays();
  }, []);

  const monthLabel = useMemo(
    () =>
      viewDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [viewDate]
  );

  const cells = useMemo(() => buildMonthCells(viewDate), [viewDate]);
  const todayKey = dateKey(new Date());
  const selectedInfo = selectedKey ? daysMap[selectedKey] : null;

  const prevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectDate = (cell) => {
    const key = dateKey(cell.date);
    setSelectedKey(key);

    if (!cell.inMonth) {
      setViewDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  return (
    <section className="school-calendar" aria-label="School calendar">
      <div className="school-calendar-header">
        <button type="button" className="school-calendar-nav" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <div className="school-calendar-title">{monthLabel}</div>
        <button type="button" className="school-calendar-nav" onClick={nextMonth} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="school-calendar-weekdays">
        {WEEK_DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="school-calendar-grid">
        {cells.map((cell) => {
          const key = dateKey(cell.date);
          const info = daysMap[key];
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              className={[
                "school-calendar-day",
                cell.inMonth ? "" : "is-outside",
                isToday ? "is-today" : "",
                key === selectedKey ? "is-selected" : "",
                info?.isHoliday ? "is-holiday" : info ? "is-schoolday" : "",
              ]
                .join(" ")
                .trim()}
              title={
                info
                  ? `${key} • ${info.isHoliday ? "Holiday" : "School Day"}${
                      info.description ? ` • ${info.description}` : ""
                    }`
                  : key
              }
              aria-label={key}
              onClick={() => selectDate(cell)}
            >
              <span>{cell.date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="school-calendar-detail" aria-live="polite">
        <div className="school-calendar-detail-date">{selectedKey || "No date selected"}</div>
        <div className="school-calendar-detail-row">
          <span className={selectedInfo?.isHoliday ? "holiday" : "schoolday"}>
            {selectedInfo ? (selectedInfo.isHoliday ? "Holiday" : "School day") : "No record"}
          </span>
          <span>
            Attendance: {selectedInfo ? `${Math.max(0, Number(selectedInfo.attendance || 0))}%` : "-"}
          </span>
        </div>
        <div className="school-calendar-detail-note">
          {selectedInfo?.description || "No description."}
        </div>
      </div>

      <div className="school-calendar-footer">
        <span className="school-calendar-legend schoolday">School day</span>
        <span className="school-calendar-legend holiday">Holiday</span>
        {loading && <span className="school-calendar-status">Loading...</span>}
        {!loading && error && <span className="school-calendar-status">{error}</span>}
      </div>
    </section>
  );
};

export default SchoolCalendarWidget;
