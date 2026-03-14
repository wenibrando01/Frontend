import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, studentsRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/students", { params: { per_page: 200 } }),
        ]);

        setStats(statsRes.data || {});
        const raw = studentsRes.data;
        const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setStudents(rows);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const exportRows = useMemo(() => {
    return students.map((s) => ({
      id: s.id,
      name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || "",
      email: s.email || "",
      course: s.course?.course_name || "",
      year_level: s.year_level || "",
      status: s.status || "active",
    }));
  }, [students]);

  const exportCsv = () => {
    const csv = toCsv(exportRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Reports</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        Student reports, enrollment statistics, and CSV export.
      </p>

      {error && <div className="admin-pill warn">{error}</div>}

      {loading ? (
        <div className="skeleton skeleton-block" style={{ height: 220 }} />
      ) : (
        <>
          <div className="admin-stats-row" style={{ marginBottom: 16 }}>
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <span className="admin-stat-label">Total Students</span>
                <span className="admin-stat-value">{stats?.total_students ?? students.length}</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <span className="admin-stat-label">Total Courses</span>
                <span className="admin-stat-value">{stats?.total_courses ?? 0}</span>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-content">
                <span className="admin-stat-label">Active Users</span>
                <span className="admin-stat-value">{stats?.active_users ?? 0}</span>
              </div>
            </div>
          </div>

          <button type="button" className="admin-btn primary" onClick={exportCsv}>
            Export Student Report (CSV)
          </button>
        </>
      )}
    </div>
  );
};

export default AdminReports;
