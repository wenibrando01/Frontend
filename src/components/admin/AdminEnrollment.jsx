import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../../services/api";

const AdminEnrollment = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoadingCourses(true);
      setError("");
      try {
        const cRes = await api.get("/admin/courses", { params: { per_page: 100 } });
        const cRaw = cRes.data;
        const cRows = Array.isArray(cRaw?.data) ? cRaw.data : Array.isArray(cRaw) ? cRaw : [];
        setCourses(cRows);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load enrollment records.");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = { per_page: 100 };
        if (search.trim()) params.search = search.trim();
        if (courseFilter) params.course_id = Number(courseFilter);
        if (yearFilter) params.year_level = Number(yearFilter);

        const sRes = await api.get("/admin/students", { params });
        const sRaw = sRes.data;
        const sRows = Array.isArray(sRaw?.data) ? sRaw.data : Array.isArray(sRaw) ? sRaw : [];
        setStudents(sRows);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load enrollment records.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, courseFilter, yearFilter]);

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Enrollment</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        View enrolled students and manage enrollment records.
      </p>

      <div className="admin-toolbar" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="admin-search-wrap" style={{ maxWidth: 340 }}>
          <Search size={18} />
          <input
            type="search"
            className="admin-input"
            placeholder="Search enrolled students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="admin-input" style={{ maxWidth: 220 }} value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>

        <select className="admin-input" style={{ maxWidth: 180 }} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All year levels</option>
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
      </div>

      {error && <div className="admin-pill warn">{error}</div>}

      <div className="admin-table-wrap">
        {loading || loadingCourses ? (
          <div className="skeleton skeleton-block" style={{ height: 260 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5}>No enrollment records found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>{`${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || "-"}</td>
                    <td>{s.email || "-"}</td>
                    <td>{s.course?.course_name || "-"}</td>
                    <td>{s.year_level || "-"}</td>
                    <td>{s.status || "active"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminEnrollment;
