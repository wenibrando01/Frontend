import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";

const AdminEnrolledCourses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [studentFilterName, setStudentFilterName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({
    subject_name: "",
    course_id: "",
    preferred_session: "",
    schedule_label: "",
    enrolled_on: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  useEffect(() => {
    const initialStudentId = searchParams.get("student_id") || "";
    const initialStudentName = searchParams.get("student_name") || "";
    if (initialStudentId) {
      setStudentFilter(initialStudentId);
      setStudentFilterName(initialStudentName);
    }
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await api.get("/admin/courses", { params: { per_page: 200 } });
        const raw = res.data;
        const items = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setCourses(items);
      } catch {
        setCourses([]);
      }
    };

    loadCourses();
  }, []);

  const loadRows = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/enrolled-subjects", {
        params: {
          search: search || undefined,
          course_id: courseFilter || undefined,
          session: sessionFilter || undefined,
          student_id: studentFilter || undefined,
          page,
          per_page: 50,
        },
      });

      const raw = res.data;
      const dataRows = Array.isArray(raw?.data) ? raw.data : [];
      setRows(dataRows);
      setMeta({
        current_page: Number(raw?.current_page || page),
        last_page: Number(raw?.last_page || 1),
        total: Number(raw?.total || dataRows.length),
      });
    } catch (err) {
      setRows([]);
      setMeta({ current_page: 1, last_page: 1, total: 0 });
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
      else setError("Failed to load enrolled subject records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRows(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, courseFilter, sessionFilter, studentFilter]);

  const openStudentSubjects = async (studentId, studentName) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setSubjects([]);
    setSubjectsError("");
    setSubjectsLoading(true);

    try {
      const res = await api.get(`/admin/students/${studentId}/enrolled-courses`);
      const detailRows = Array.isArray(res.data?.subjects) ? res.data.subjects : [];
      setSubjects(detailRows);
    } catch (err) {
      setSubjectsError(err.response?.data?.message || "Failed to load enrolled subjects.");
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    if (!studentFilter) return;
    const name = studentFilterName || `Student #${studentFilter}`;
    openStudentSubjects(studentFilter, name);
  }, [studentFilter]);

  const closeModal = () => {
    setSelectedStudent(null);
    setSubjects([]);
    setSubjectsError("");
    setSubjectsLoading(false);
  };

  const openEdit = (row) => {
    setEditError("");
    setEditRow(row);
    setEditForm({
      subject_name: row.subject_name || "",
      course_id: row.course_id ? String(row.course_id) : "",
      preferred_session: row.preferred_session || "",
      schedule_label: row.schedule_label || "",
      enrolled_on: row.enrolled_on || "",
    });
  };

  const closeEdit = () => {
    setEditRow(null);
    setEditError("");
    setEditSaving(false);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editRow) return;

    setEditSaving(true);
    setEditError("");

    try {
      await api.patch(`/admin/enrolled-subjects/${editRow.id}`, {
        subject_name: editForm.subject_name,
        course_id: Number(editForm.course_id),
        preferred_session: editForm.preferred_session || null,
        schedule_label: editForm.schedule_label || null,
        enrolled_on: editForm.enrolled_on || null,
      });

      await loadRows(meta.current_page || 1);
      if (selectedStudent?.id === editRow.student_id) {
        await openStudentSubjects(editRow.student_id, selectedStudent.name || "Student");
      }
      closeEdit();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update enrolled subject.");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteRow = async (row) => {
    setDeletingId(row.id);
    setError("");
    try {
      await api.delete(`/admin/enrolled-subjects/${row.id}`);

      const nextPage = rows.length === 1 && (meta.current_page || 1) > 1
        ? (meta.current_page - 1)
        : (meta.current_page || 1);
      await loadRows(nextPage);

      if (selectedStudent?.id === row.student_id) {
        await openStudentSubjects(row.student_id, selectedStudent.name || "Student");
      }
      setDeleteCandidate(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete enrolled subject.");
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (row) => {
    setDeleteCandidate(row);
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setDeleteCandidate(null);
  };

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  const clearStudentFilter = () => {
    setStudentFilter("");
    setStudentFilterName("");
    setSearchParams({});
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > meta.last_page) return;
    loadRows(nextPage);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        await loadRows(1);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load enrolled subject records.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="admin-content enrolled-courses-page">
      <style>{`
        .enrolled-courses-page {
          display: grid;
          gap: 14px;
        }
        .enrolled-courses-page .admin-page-header {
          margin-bottom: 0;
        }
        .enrolled-courses-page .enrolled-courses-intro {
          margin: 0;
          color: #5f728f;
          font-size: 0.95rem;
        }
        .enrolled-courses-page .enrolled-toolbar {
          display: grid;
          grid-template-columns: minmax(260px, 1.2fr) repeat(2, minmax(180px, 220px));
          gap: 10px;
          align-items: center;
        }
        .enrolled-courses-page .enrolled-toolbar .admin-search-wrap {
          max-width: none !important;
        }
        .enrolled-courses-page .enrolled-table-shell {
          border: 1px solid #dbe3ef;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 12px 30px rgba(17, 24, 39, 0.05);
        }
        .enrolled-courses-page .enrolled-actions {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
          min-width: 122px;
        }
        .enrolled-courses-page .enrolled-col-actions {
          width: 132px;
          white-space: nowrap;
          text-align: right;
          padding-right: 8px;
        }
        .enrolled-courses-page .enrolled-actions .admin-btn.icon {
          width: 34px;
          height: 34px;
          min-width: 34px;
          min-height: 34px;
          padding: 0;
          border-radius: 10px;
        }
        .enrolled-courses-page .enrolled-actions .admin-btn.icon + .admin-btn.icon {
          margin-left: 0;
        }
        .enrolled-courses-page .enrolled-pagination {
          justify-content: space-between;
          margin-top: 0;
          padding-top: 6px;
        }
        .enrolled-courses-page .enrolled-delete-modal {
          max-width: 520px !important;
          border-radius: 20px;
          border: 1px solid #e3e9f4;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
        }
        .enrolled-courses-page .enrolled-delete-modal .admin-modal-actions {
          justify-content: flex-end;
        }
        .enrolled-courses-page .enrolled-delete-title {
          margin: 0;
          font-size: 2rem;
          letter-spacing: -0.02em;
        }
        .enrolled-courses-page .enrolled-delete-sub {
          margin: 10px 0 14px;
          color: #60728f;
          font-size: 1.05rem;
        }
        .enrolled-courses-page .enrolled-delete-card {
          border: 1px solid #d7dfec;
          border-radius: 14px;
          background: linear-gradient(180deg, #f8fbff 0%, #f4f8ff 100%);
          padding: 12px 14px;
          display: grid;
          gap: 4px;
          margin-bottom: 16px;
        }
        .enrolled-courses-page .enrolled-delete-meta {
          color: #5b6e8c;
          font-size: 0.95rem;
        }
        .enrolled-courses-page .admin-btn.danger {
          border-color: #ef4444;
          color: #b91c1c;
          background: #fff;
        }
        .enrolled-courses-page .admin-btn.danger:hover {
          background: #fee2e2;
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-courses-intro,
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-delete-sub,
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-delete-meta {
          color: #a9b9d6;
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-table-shell,
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-delete-modal {
          background: #0f172a;
          border-color: rgba(148, 163, 184, 0.28);
          box-shadow: 0 20px 48px rgba(2, 6, 23, 0.48);
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-delete-card {
          border-color: rgba(148, 163, 184, 0.34);
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.76) 0%, rgba(15, 23, 42, 0.84) 100%);
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-delete-title {
          color: #e6eeff;
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-actions .admin-btn.icon {
          background: rgba(18, 32, 56, 0.72);
          border-color: rgba(148, 163, 184, 0.34);
          color: #dbe8ff;
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-actions .admin-btn.icon:hover {
          background: rgba(30, 44, 72, 0.84);
          border-color: rgba(165, 180, 252, 0.45);
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-actions .admin-btn.icon.danger {
          border-color: rgba(239, 68, 68, 0.66);
          color: #fecaca;
          background: rgba(127, 29, 29, 0.08);
        }
        .admin-layout.admin-theme-dark .enrolled-courses-page .enrolled-actions .admin-btn.icon.danger:hover {
          background: rgba(153, 27, 27, 0.2);
          border-color: rgba(248, 113, 113, 0.78);
        }
        @media (max-width: 1100px) {
          .enrolled-courses-page .enrolled-toolbar {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 900px) {
          .enrolled-courses-page .enrolled-col-actions {
            width: auto;
            text-align: left;
            padding-right: 12px;
          }
          .enrolled-courses-page .enrolled-actions {
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Students Enrolled Course</h1>
      </div>

      <p className="enrolled-courses-intro">
        View and filter all student enrolled subjects. Open any student for full subject history.
      </p>

      {studentFilter && (
        <div className="admin-toolbar" style={{ marginBottom: 10 }}>
          <span className="admin-pill success" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Viewing records for {studentFilterName || `Student #${studentFilter}`}
          </span>
          <button type="button" className="admin-btn" onClick={clearStudentFilter}>Show all students</button>
        </div>
      )}

      <div className="admin-toolbar enrolled-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            type="search"
            className="admin-input"
            placeholder="Search by student, email, course, subject, or session"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-input"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>

        <select
          className="admin-input"
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
        >
          <option value="">All sessions</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      {error && <div className="admin-pill warn">{error}</div>}

      <div className="admin-table-wrap enrolled-table-shell">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 280 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Course</th>
                <th>Subject</th>
                <th>Session</th>
                <th>Enrolled On</th>
                <th className="enrolled-col-actions admin-table-col-actions">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>No enrolled records found.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.student_name || "-"}</td>
                    <td>{row.student_email || "-"}</td>
                    <td>{row.course_name || "-"}</td>
                    <td>{row.subject_name || "-"}</td>
                    <td>{row.preferred_session || "-"}</td>
                    <td>{row.enrolled_on || "-"}</td>
                    <td className="enrolled-col-actions admin-table-col-actions">
                      <div className="enrolled-actions admin-table-actions">
                        <button
                          type="button"
                          className="admin-btn"
                          onClick={() => openStudentSubjects(row.student_id, row.student_name || "Student")}
                        >
                          <Eye size={16} /> View enrolled subjects
                        </button>
                        <button
                          type="button"
                          className="admin-btn icon"
                          onClick={() => openEdit(row)}
                          title="Edit enrolled subject"
                          aria-label="Edit enrolled subject"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          className="admin-btn icon danger"
                          onClick={() => requestDelete(row)}
                          disabled={deletingId === row.id}
                          title="Delete enrolled subject"
                          aria-label="Delete enrolled subject"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="admin-toolbar enrolled-pagination">
        <span className="admin-muted">Total records: {meta.total}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="admin-btn" disabled={!canPrev || loading} onClick={() => changePage(meta.current_page - 1)}>
            Prev
          </button>
          <span className="admin-muted" style={{ alignSelf: "center" }}>
            Page {meta.current_page} of {meta.last_page}
          </span>
          <button type="button" className="admin-btn" disabled={!canNext || loading} onClick={() => changePage(meta.current_page + 1)}>
            Next
          </button>
        </div>
      </div>

      {selectedStudent && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="enrolled-subjects-title">
          <form className="admin-modal" onSubmit={(e) => e.preventDefault()}>
            <h2 id="enrolled-subjects-title">Enrolled Subjects</h2>

            <p className="admin-muted" style={{ marginTop: 4, marginBottom: 12 }}>
              {selectedStudent.name || "Student"}
            </p>

            {subjectsError && <div className="admin-pill warn">{subjectsError}</div>}

            <div className="admin-table-wrap" style={{ maxHeight: 320, overflow: "auto" }}>
              {subjectsLoading ? (
                <div className="skeleton skeleton-block" style={{ height: 170 }} />
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Course</th>
                      <th>Session</th>
                      <th>Schedule</th>
                      <th>Enrolled On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.length === 0 ? (
                      <tr>
                        <td colSpan={5}>No enrolled subjects yet.</td>
                      </tr>
                    ) : (
                      subjects.map((row) => (
                        <tr key={row.id}>
                          <td>{row.subject_name || "-"}</td>
                          <td>{row.course_name || "-"}</td>
                          <td>{row.preferred_session || "-"}</td>
                          <td>{row.schedule_label || "-"}</td>
                          <td>{row.enrolled_on || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn" onClick={closeModal}>Close</button>
            </div>
          </form>
        </div>
      )}

      {editRow && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-enrollment-title">
          <form className="admin-modal" onSubmit={submitEdit}>
            <h2 id="edit-enrollment-title">Edit Enrolled Subject</h2>

            {editError && <div className="admin-pill warn">{editError}</div>}

            <div className="admin-form-row">
              <label>Student</label>
              <div className="admin-input" style={{ display: "grid", gap: 2 }}>
                <strong>{editRow.student_name || "Student"}</strong>
                <span className="admin-muted" style={{ fontSize: 12 }}>{editRow.student_email || "-"}</span>
              </div>
            </div>

            <div className="admin-form-row">
              <label>Subject</label>
              <input
                className="admin-input"
                value={editForm.subject_name}
                onChange={(e) => setEditForm((f) => ({ ...f, subject_name: e.target.value }))}
                required
                disabled={editSaving}
              />
            </div>

            <div className="admin-form-row">
              <label>Course</label>
              <select
                className="admin-input"
                value={editForm.course_id}
                onChange={(e) => setEditForm((f) => ({ ...f, course_id: e.target.value }))}
                required
                disabled={editSaving}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.course_name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-row">
              <label>Session</label>
              <select
                className="admin-input"
                value={editForm.preferred_session}
                onChange={(e) => setEditForm((f) => ({ ...f, preferred_session: e.target.value }))}
                disabled={editSaving}
              >
                <option value="">None</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div className="admin-form-row">
              <label>Schedule Label</label>
              <input
                className="admin-input"
                value={editForm.schedule_label}
                onChange={(e) => setEditForm((f) => ({ ...f, schedule_label: e.target.value }))}
                disabled={editSaving}
              />
            </div>

            <div className="admin-form-row">
              <label>Enrolled On</label>
              <input
                type="date"
                className="admin-input"
                value={editForm.enrolled_on}
                onChange={(e) => setEditForm((f) => ({ ...f, enrolled_on: e.target.value }))}
                disabled={editSaving}
              />
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn" onClick={closeEdit} disabled={editSaving}>Cancel</button>
              <button type="submit" className="admin-btn primary" disabled={editSaving}>
                {editSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteCandidate && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-enrollment-title">
          <div className="admin-modal enrolled-delete-modal">
            <h2 id="delete-enrollment-title" className="enrolled-delete-title">Delete Enrolled Subject</h2>

            <p className="enrolled-delete-sub">
              This action cannot be undone.
            </p>

            <div className="enrolled-delete-card">
              <strong>{deleteCandidate.subject_name || "Selected Subject"}</strong>
              <span className="enrolled-delete-meta">
                {deleteCandidate.student_name || "Student"} • {deleteCandidate.course_name || "Course"}
              </span>
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn danger"
                onClick={() => deleteRow(deleteCandidate)}
                disabled={deletingId === deleteCandidate.id}
              >
                {deletingId === deleteCandidate.id ? "Deleting..." : "Delete"}
              </button>
              <button type="button" className="admin-btn" onClick={cancelDelete} disabled={Boolean(deletingId)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnrolledCourses;
