import React, { useEffect, useState } from "react";
import api from "../../services/api";

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/student/grades");
        const raw = res.data;
        const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setGrades(rows);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load grades.");
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
            <div className="cardx-title">Grades</div>
            <div className="cardx-description muted">Grades per subject and semester.</div>
          </div>
        </div>
        <div className="cardx-body">
          {error && <div className="pill warn">{error}</div>}
          {!error && grades.length === 0 && <p className="muted">No grades published yet.</p>}

          {!error && grades.length > 0 && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>School Year</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td>{g.subject_name || "-"}</td>
                      <td>{g.course?.course_name || "-"}</td>
                      <td>{g.semester || "-"}</td>
                      <td>{g.school_year || "-"}</td>
                      <td>{g.status || (g.grade !== null ? "Published" : "Pending")}</td>
                      <td>{g.grade ?? "-"}</td>
                      <td>{g.remarks || "-"}</td>
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

export default GradesPage;
