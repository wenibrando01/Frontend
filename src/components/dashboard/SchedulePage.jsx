import React, { useEffect, useState } from "react";
import api from "../../services/api";

const SchedulePage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/student/schedule");
        const raw = res.data;
        const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setRows(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load schedule.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="educo-content"><div className="skeleton skeleton-block" /></div>;

  return (
    <div className="educo-content">
      <div className="cardx">
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Schedule</div>
            <div className="cardx-description muted">Class timetable and school-day schedule.</div>
          </div>
        </div>
        <div className="cardx-body">
          {error && <div className="pill warn">{error}</div>}
          {!error && rows.length === 0 && <p className="muted">No schedule available.</p>}
          {!error && rows.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Description</th>
                    <th>Holiday</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                      <td>{r.start_time ? String(r.start_time).slice(0, 5) : "-"}</td>
                      <td>{r.end_time ? String(r.end_time).slice(0, 5) : "-"}</td>
                      <td>{r.description || "-"}</td>
                      <td>{r.is_holiday ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
