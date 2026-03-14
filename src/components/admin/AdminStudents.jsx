import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";

const AdminStudents = () => {
  const [list, setList] = useState({ data: [], meta: {} });
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCourseId, setBulkCourseId] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [courseOnlyMode, setCourseOnlyMode] = useState(false);
  const [courseHistoryLoading, setCourseHistoryLoading] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolledSubjects, setEnrolledSubjects] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    course_id: "",
    year_level: 1,
    status: "active"
  });
  const [saving, setSaving] = useState(false);
  const [tableError, setTableError] = useState("");
  const [tableSuccess, setTableSuccess] = useState("");
  const [formError, setFormError] = useState("");
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [autoAssignConfirmOpen, setAutoAssignConfirmOpen] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setTableError("");
    try {
      const res = await api.get("/admin/students", {
        params: {
          search: search || undefined,
          course_id: courseFilter || undefined,
          year_level: yearFilter || undefined,
          status: statusFilter || undefined,
          per_page: 200,
        }
      });
      const raw = res.data;
      const listData = Array.isArray(raw?.data) ? raw : { data: Array.isArray(raw) ? raw : [], meta: raw?.meta ?? {} };
      setList(listData);
      const visibleIds = new Set((listData.data || []).map((s) => Number(s.id)));
      setSelectedIds((prev) => prev.filter((id) => visibleIds.has(Number(id))));
    } catch (err) {
      setList({ data: [], meta: {} });
      if (err.response?.status === 401) setTableError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setTableError("Access denied.");
      else setTableError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await api.get("/admin/courses", { params: { per_page: 100 } });
      const raw = res.data;
      const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      setCourses(arr);
    } catch {
      setCourses([]);
    }
  };

  // Auto-dismiss table errors
  useEffect(() => {
    if (!tableError) return;
    const timer = setTimeout(() => setTableError(""), 5000);
    return () => clearTimeout(timer);
  }, [tableError]);

  useEffect(() => {
    if (!tableSuccess) return;
    const timer = setTimeout(() => setTableSuccess(""), 4000);
    return () => clearTimeout(timer);
  }, [tableSuccess]);

  useEffect(() => {
    loadStudents();
    const timer = setInterval(() => {
      loadStudents();
    }, 10000);
    return () => clearInterval(timer);
  }, [search, courseFilter, yearFilter, statusFilter]);
  useEffect(() => { loadCourses(); }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") openAdd();
  }, []);

  const openEdit = (row) => {
    setCourseOnlyMode(false);
    setFormError("");
    setForm({
      first_name: row.first_name ?? row.name?.split(" ")[0] ?? "",
      last_name: row.last_name ?? row.name?.split(" ").slice(1).join(" ") ?? "",
      email: row.email ?? "",
      course_id: row.course_id ?? row.course?.id ?? "",
      year_level: row.year_level ?? 1,
      status: row.status ?? "active",
    });
    setModal(row.id);
  };

  const courseViewHref = (row) => {
    const displayName = (row.first_name || row.last_name)
      ? `${row.first_name || ""} ${row.last_name || ""}`.trim()
      : (row.name || "Student");
    return `/admin/dashboard/enrolled-courses?student_id=${encodeURIComponent(String(row.id))}&student_name=${encodeURIComponent(displayName)}`;
  };

  const openAdd = () => {
    setCourseOnlyMode(false);
    setFormError("");
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      course_id: courses[0]?.id ?? "",
      year_level: 1,
      status: "active"
    });
    setModal("add");
  };

  const closeModal = () => {
    setModal(null);
    setCourseOnlyMode(false);
    setEnrolledCourses([]);
    setEnrolledSubjects([]);
    setCourseHistoryLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (modal === "add") {
        await api.post("/admin/students", { ...form, course_id: form.course_id || undefined });
      } else {
        if (courseOnlyMode) {
          await api.patch("/admin/students/" + modal, {
            course_id: form.course_id || null,
          });
        } else {
          await api.patch("/admin/students/" + modal, form);
        }
      }
      closeModal();
      loadStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/admin/students/" + id);
      loadStudents();
      setDeleteStudentId(null);
    } catch {
      setTableError("Failed to delete.");
    }
  };

  const toggleSelectOne = (studentId) => {
    const id = Number(studentId);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllVisible = () => {
    const ids = (data || []).map((row) => Number(row.id));
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : ids);
  };

  const applyBulkCourse = async () => {
    if (selectedIds.length === 0) {
      setTableError("Select at least one student.");
      return;
    }

    setBulkSaving(true);
    setTableError("");
    setTableSuccess("");
    try {
      const res = await api.post("/admin/students/bulk-course", {
        student_ids: selectedIds,
        course_id: bulkCourseId ? Number(bulkCourseId) : null,
      });
      setTableSuccess(res.data?.message || "Students updated.");
      setSelectedIds([]);
      loadStudents();
    } catch (err) {
      setTableError(err.response?.data?.message || "Bulk update failed.");
    } finally {
      setBulkSaving(false);
    }
  };

  const autoAssignUnassigned = async () => {
    setBulkSaving(true);
    setTableError("");
    setTableSuccess("");
    try {
      const res = await api.post("/admin/students/auto-assign-courses");
      const assigned = Number(res.data?.assigned || 0);
      const byDept = Number(res.data?.matched_by_department || 0);
      const byFallback = Number(res.data?.assigned_by_fallback || 0);
      setTableSuccess(`Auto-assigned ${assigned} students (${byDept} by department, ${byFallback} by fallback).`);
      setSelectedIds([]);
      loadStudents();
      setAutoAssignConfirmOpen(false);
    } catch (err) {
      setTableError(err.response?.data?.message || "Auto-assign failed.");
    } finally {
      setBulkSaving(false);
    }
  };

  const data = list.data ?? list;
  const allVisibleSelected = data.length > 0 && data.every((row) => selectedIds.includes(Number(row.id)));

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Students</h1>
        <button type="button" className="admin-btn primary" onClick={openAdd}>
          <Plus size={18} /> Add Student
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input
            type="search"
            placeholder="What do you need? Search name, email, student ID, or course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
        </div>
        <select
          className="admin-input"
          style={{ maxWidth: 260 }}
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
          style={{ maxWidth: 140 }}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All years</option>
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
        <select
          className="admin-input"
          style={{ maxWidth: 150 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          className="admin-input"
          style={{ maxWidth: 280 }}
          value={bulkCourseId}
          onChange={(e) => setBulkCourseId(e.target.value)}
          disabled={bulkSaving}
        >
          <option value="">Set selected to Unassigned</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_name}</option>
          ))}
        </select>
        <button
          type="button"
          className="admin-btn"
          onClick={applyBulkCourse}
          disabled={bulkSaving || selectedIds.length === 0}
        >
          {bulkSaving ? "Applying…" : `Apply to ${selectedIds.length} selected`}
        </button>
        <button
          type="button"
          className="admin-btn"
          onClick={() => setAutoAssignConfirmOpen(true)}
          disabled={bulkSaving}
          title="Auto-assign unassigned students"
        >
          {bulkSaving ? "Running…" : "Auto-assign Unassigned"}
        </button>
      </div>

      <div className="admin-muted" style={{ marginBottom: 10, fontSize: 13, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span>Try:</span>
        <button type="button" className="admin-btn" style={{ padding: "4px 10px", borderRadius: 999 }} onClick={() => setSearch("Maria Santos")}>Name</button>
        <button type="button" className="admin-btn" style={{ padding: "4px 10px", borderRadius: 999 }} onClick={() => setSearch("student@gmail.com")}>Email</button>
        <button type="button" className="admin-btn" style={{ padding: "4px 10px", borderRadius: 999 }} onClick={() => setSearch("125")}>Student ID</button>
        <button type="button" className="admin-btn" style={{ padding: "4px 10px", borderRadius: 999 }} onClick={() => setSearch("BSIT")}>Course Code</button>
      </div>

      {/* Table-level error */}
      {tableError && <div className="admin-pill warn">{tableError}</div>}
      {tableSuccess && <div className="admin-pill success">{tableSuccess}</div>}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 300 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible students"
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
                <th className="admin-students-col-actions admin-table-col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={7}>No students found.</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(Number(row.id))}
                        onChange={() => toggleSelectOne(row.id)}
                        aria-label={`Select ${row.first_name || row.name || "student"}`}
                      />
                    </td>
                    <td>{row.first_name || row.last_name ? `${row.first_name || ""} ${row.last_name || ""}`.trim() : row.name}</td>
                    <td>{row.email}</td>
                    <td>
                      <div className="admin-course-cell">
                        <span className="admin-course-name" title={row.course?.course_name ?? "Unassigned"}>{row.course?.course_name ?? "—"}</span>
                        <Link
                          to={courseViewHref(row)}
                          className="admin-btn admin-btn-course-view"
                          title="View enrolled course and subjects"
                        >
                          <Eye size={14} /> View course
                        </Link>
                      </div>
                    </td>
                    <td>{row.year_level ?? "—"}</td>
                    <td>{row.status ?? "active"}</td>
                    <td className="admin-students-col-actions admin-table-col-actions">
                      <div className="admin-students-actions admin-table-actions">
                        <button type="button" className="admin-btn icon" onClick={() => openEdit(row)}>
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn icon danger" onClick={() => setDeleteStudentId(row.id)}>
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

      {/* Modal */}
      {modal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === "add" ? "Add Student" : courseOnlyMode ? "View / Edit Course" : "Edit Student"}</h3>
            <form onSubmit={handleSubmit}>
              {/* Form-level error */}
              {formError && <div className="admin-pill warn">{formError}</div>}

              {courseOnlyMode && (
                <div className="admin-form-row">
                  <label>Student</label>
                  <div className="admin-input" style={{ display: "grid", gap: 2 }}>
                    <strong>{`${form.first_name || ""} ${form.last_name || ""}`.trim() || "Student"}</strong>
                    <span className="admin-muted" style={{ fontSize: 12 }}>{form.email || "-"}</span>
                  </div>
                </div>
              )}

              {courseOnlyMode && (
                <div className="admin-form-row">
                  <label>Enrolled Subjects</label>
                  {courseHistoryLoading ? (
                    <div className="skeleton skeleton-block" style={{ height: 120 }} />
                  ) : enrolledSubjects.length === 0 ? (
                    <p className="admin-muted" style={{ margin: 0 }}>No enrolled subjects yet.</p>
                  ) : (
                    <div className="admin-table-wrap" style={{ maxHeight: 210, overflow: "auto" }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Course</th>
                            <th>Session</th>
                            <th>Enrolled On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrolledSubjects.map((s) => (
                            <tr key={s.id}>
                              <td>{s.subject_name || "-"}</td>
                              <td>{s.course_name || "-"}</td>
                              <td>{s.preferred_session || "-"}</td>
                              <td>{s.enrolled_on || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {courseOnlyMode && enrolledCourses.length > 0 && (
                <p className="admin-muted" style={{ margin: "4px 0 12px" }}>
                  Enrolled courses: {enrolledCourses.map((c) => c.course_name).join(", ")}
                </p>
              )}

              {!courseOnlyMode && (
                <>
              <div className="admin-form-row">
                <label>First name</label>
                <input
                  className="admin-input"
                  value={form.first_name}
                  onChange={(e) => setForm(f => ({ ...f, first_name: e.target.value }))}
                  required
                  disabled={saving}
                />
              </div>
              <div className="admin-form-row">
                <label>Last name</label>
                <input
                  className="admin-input"
                  value={form.last_name}
                  onChange={(e) => setForm(f => ({ ...f, last_name: e.target.value }))}
                  required
                  disabled={saving}
                />
              </div>
              <div className="admin-form-row">
                <label>Email</label>
                <input
                  type="email"
                  className="admin-input"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                  disabled={saving}
                />
              </div>
                </>
              )}
              <div className="admin-form-row">
                <label>Course</label>
                <select
                  className="admin-input"
                  value={form.course_id}
                  onChange={(e) => setForm(f => ({ ...f, course_id: e.target.value }))}
                  disabled={saving}
                >
                  <option value="">Select course (optional)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              {!courseOnlyMode && (
                <>
                  <div className="admin-form-row">
                    <label>Year level</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="admin-input"
                      value={form.year_level}
                      onChange={(e) => setForm(f => ({ ...f, year_level: +e.target.value || 1 }))}
                      disabled={saving}
                    />
                  </div>
                  <div className="admin-form-row">
                    <label>Status</label>
                    <select
                      className="admin-input"
                      value={form.status}
                      onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                      disabled={saving}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteStudentId)}
        title="Delete Student"
        message="This action cannot be undone."
        meta="The selected student will be removed permanently."
        confirmText="Delete"
        onConfirm={() => handleDelete(deleteStudentId)}
        onCancel={() => setDeleteStudentId(null)}
      />

      <ConfirmDialog
        open={autoAssignConfirmOpen}
        title="Auto-assign Unassigned Students"
        message="Assign all currently unassigned students to available courses now?"
        meta="This will update enrollment mappings in bulk."
        confirmText="Run auto-assign"
        confirmClassName="admin-btn primary"
        isLoading={bulkSaving}
        onConfirm={autoAssignUnassigned}
        onCancel={() => {
          if (!bulkSaving) setAutoAssignConfirmOpen(false);
        }}
      />
    </div>
  );
};

export default AdminStudents;