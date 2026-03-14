import React, { useEffect, useState } from "react";
import api from "../../services/api";

const MINOR_SUBJECT_TITLES = [
  "business communication",
  "business law",
  "economics",
  "entrepreneurship",
  "professional ethics",
  "psychological ethics",
  "workplace ethics",
  "research methods",
  "research methods in it",
  "research methods in psychology",
  "research methods in criminology",
  "research in education",
  "research in mathematics education",
  "research in physical education",
  "engineering research",
  "statistics for psychology",
  "business statistics",
  "probability and statistics",
  "values education",
  "general psychology",
];

function unitsForSubject(subjectName) {
  const value = String(subjectName || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return MINOR_SUBJECT_TITLES.includes(value) ? 3 : 4;
}

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flash, setFlash] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("my_courses_flash");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.message) setFlash(parsed.message);
      localStorage.removeItem("my_courses_flash");
    } catch {
      // Ignore parsing/storage errors.
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [courseRes, enrollmentRes] = await Promise.all([
          api.get("/student/my-courses"),
          api.get("/student/enrollments"),
        ]);

        const courseRaw = courseRes.data;
        const enrollmentRaw = enrollmentRes.data;
        const courseRows = Array.isArray(courseRaw?.data) ? courseRaw.data : Array.isArray(courseRaw) ? courseRaw : [];
        const enrollmentRows = Array.isArray(enrollmentRaw?.data)
          ? enrollmentRaw.data
          : Array.isArray(enrollmentRaw)
          ? enrollmentRaw
          : [];

        setCourses(courseRows);
        setEnrollments(enrollmentRows);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses.");
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
            <div className="cardx-title">My Courses</div>
            <div className="cardx-description muted">Your primary course and enrolled subjects.</div>
          </div>
        </div>
        <div className="cardx-body">
          {flash && <div className="pill success" style={{ marginBottom: 10 }}>{flash}</div>}
          {error && <div className="pill warn">{error}</div>}
          {!error && courses.length === 0 && <p className="muted">No course found.</p>}
          <div style={{ display: "grid", gap: 10 }}>
            {courses.map((c) => (
              <div key={c.id} className="cardx" style={{ boxShadow: "none" }}>
                <div className="cardx-body" style={{ padding: 12 }}>
                  <strong>{c.course_name}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {c.course_code || "-"} • {c.department || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {!error && (
            <div className="cardx" style={{ boxShadow: "none", marginTop: 14 }}>
              <div className="cardx-header">
                <div className="cardx-title">Enrolled Subjects</div>
              </div>
              <div className="cardx-body" style={{ paddingTop: 10 }}>
                {enrollments.length === 0 ? (
                  <p className="muted">No enrolled subjects yet.</p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Course</th>
                          <th>Units</th>
                          <th>Session</th>
                          <th>Schedule</th>
                          <th>Enrolled On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enrollments.map((e) => (
                          <tr key={e.id}>
                            <td>{e.subject_name || "-"}</td>
                            <td>{e.course?.course_name || "-"}</td>
                            <td>{unitsForSubject(e.subject_name)}</td>
                            <td>{e.preferred_session || "-"}</td>
                            <td>{e.schedule_label || "-"}</td>
                            <td>{e.enrolled_on ? new Date(e.enrolled_on).toLocaleDateString() : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
