import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../../services/api";

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/school-days", { params: { per_page: 200, search: search || undefined } });
        const raw = res.data;
        const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setEvents(rows);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Events</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        Create and manage school events shown to students.
      </p>

      <div className="admin-toolbar">
        <div className="admin-search-wrap" style={{ maxWidth: 340 }}>
          <Search size={18} />
          <input
            type="search"
            className="admin-input"
            placeholder="Search events by description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="admin-pill warn">{error}</div>}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 260 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Event / Description</th>
                <th>Attendance</th>
                <th>Holiday</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4}>No events found.</td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.date ? new Date(e.date).toISOString().slice(0, 10) : "-"}</td>
                    <td>{e.description || "General school day"}</td>
                    <td>{e.attendance_rate ?? 0}%</td>
                    <td>{e.is_holiday ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-muted" style={{ marginTop: 12 }}>
        Need full create/edit/delete event controls? Use the existing School Days manager at /admin/dashboard/school-days.
      </p>
    </div>
  );
};

export default AdminEvents;
