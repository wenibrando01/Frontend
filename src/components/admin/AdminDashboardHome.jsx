import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Calendar, UserCheck, PlusCircle, RefreshCw } from "lucide-react";
import api from "../../services/api";

const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const loadStatsAndActivity = useCallback(async () => {
    setStatsError("");
    try {
      const [sRes, aRes] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/dashboard/recent-activity?limit=5"),
      ]);
      setStats(sRes.data);
      setActivity(Array.isArray(aRes.data?.data) ? aRes.data.data : aRes.data || []);
    } catch (err) {
      setStats(null);
      setActivity([]);
      if (err.response?.status === 401) {
        setStatsError("Session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setStatsError("Access denied.");
      } else {
        setStatsError(
          "Could not load dashboard. Ensure the Laravel API is running (php artisan serve) and VITE_API_BASE_URL is set in .env (e.g. http://127.0.0.1:8000/api). Run seeders: php artisan db:seed"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatsAndActivity();
  }, [loadStatsAndActivity]);

  useEffect(() => {
    const onVisible = () => loadStatsAndActivity();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [loadStatsAndActivity]);

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-stats-row">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-stat-card skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { key: "total_students", label: "Total Students", icon: Users, color: "#3b82f6" },
    { key: "total_courses", label: "Total Courses", icon: BookOpen, color: "#059669" },
    { key: "total_school_days", label: "Total School Days", icon: Calendar, color: "#7c3aed" },
    { key: "active_users", label: "Active Users", icon: UserCheck, color: "#dc2626" },
  ];

  return (
    <div className="admin-content admin-dashboard-home">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <button type="button" className="admin-btn primary" onClick={() => { setLoading(true); loadStatsAndActivity(); }} aria-label="Refresh stats">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      {statsError && (
        <div className="admin-pill warn" style={{ marginBottom: 16 }}>
          {statsError}
        </div>
      )}

      <div className="admin-stats-row admin-dashboard-stats">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="admin-stat-card reveal-block">
            <div className="admin-stat-icon" style={{ backgroundColor: color + "22", color }}>
              <Icon size={24} />
            </div>
            <div className="admin-stat-content">
              <span className="admin-stat-label">{label}</span>
              <span className="admin-stat-value">{(stats && stats[key]) ?? 0}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-quick-actions admin-dashboard-quick-actions reveal-block">
        <h2>Quick actions</h2>
        <div className="admin-quick-actions-grid admin-dashboard-quick-grid">
          <button type="button" className="admin-quick-btn" onClick={() => navigate("/admin/dashboard/students?add=1")}>
            <PlusCircle size={20} /> Add Student
          </button>
          <button type="button" className="admin-quick-btn" onClick={() => navigate("/admin/dashboard/courses?add=1")}>
            <PlusCircle size={20} /> Add Course
          </button>
          <button type="button" className="admin-quick-btn" onClick={() => navigate("/admin/dashboard/school-days?add=1")}>
            <PlusCircle size={20} /> Add School Day
          </button>
          <button type="button" className="admin-quick-btn" onClick={() => navigate("/admin/dashboard/enrolled-courses")}>
            <Users size={20} /> Students Enrolled Course
          </button>
        </div>
      </div>

      <div className="admin-recent-activity admin-dashboard-activity reveal-block">
        <h2>Recent activity</h2>
        {activity.length === 0 ? (
          <p className="admin-muted">No recent activity.</p>
        ) : (
          <ul className="admin-activity-list">
            {activity.map((a, i) => (
              <li key={i}>{a.description} — {a.date ? new Date(a.date).toLocaleString() : ""}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
