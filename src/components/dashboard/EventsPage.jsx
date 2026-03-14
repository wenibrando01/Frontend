import React, { useEffect, useState } from "react";
import api from "../../services/api";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/student/events");
        const raw = res.data;
        const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setEvents(rows);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load events.");
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
            <div className="cardx-title">Events</div>
            <div className="cardx-description muted">School and academic events.</div>
          </div>
        </div>
        <div className="cardx-body">
          {error && <div className="pill warn">{error}</div>}
          {!error && events.length === 0 && <p className="muted">No events found.</p>}

          <div style={{ display: "grid", gap: 10 }}>
            {events.map((e) => (
              <div key={e.id} className="cardx" style={{ boxShadow: "none" }}>
                <div className="cardx-body" style={{ padding: 12 }}>
                  <strong>{e.description || "School Event"}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {e.date ? new Date(e.date).toLocaleDateString() : "-"}
                    {e.is_holiday ? " • Holiday" : ""}
                    {e.start_time ? ` • ${String(e.start_time).slice(0, 5)}` : ""}
                    {e.end_time ? ` - ${String(e.end_time).slice(0, 5)}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
