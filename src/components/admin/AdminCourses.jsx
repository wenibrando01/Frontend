import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";

const AdminCourses = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ course_name: "", course_code: "", department: "", description: "", status: "active" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/courses", { params: { search: search || undefined, per_page: 50 } });
      const raw = res.data;
      const arr = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      setList(arr);
    } catch (err) {
      setList([]);
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [search]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("add") === "1") {
      setForm({ course_name: "", course_code: "", department: "", description: "", status: "active" });
      setModal("add");
    }
  }, []);

  const openEdit = (row) => {
    setForm({
      course_name: row.course_name ?? "",
      course_code: row.course_code ?? "",
      department: row.department ?? "",
      description: row.description ?? "",
      status: row.status ?? "active",
    });
    setModal(row.id);
    setError("");
  };

  const openAdd = () => {
    setForm({ course_name: "", course_code: "", department: "", description: "", status: "active" });
    setModal("add");
    setError("");
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (modal === "add") {
        await api.post("/admin/courses", form);
      } else {
        await api.patch("/admin/courses/" + modal, form);
      }
      closeModal();
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/admin/courses/" + id);
      loadCourses();
      setDeleteId(null);
    } catch {
      setError("Failed to delete.");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Courses</h1>
        <button type="button" className="admin-btn primary" onClick={openAdd}>
          <Plus size={18} /> Add Course
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input type="search" placeholder="Search courses…" value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input" />
        </div>
      </div>

      {error && <div className="admin-pill warn">{error}</div>}

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 300 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course name</th>
                <th>Code</th>
                <th>Department</th>
                <th>Status</th>
                <th className="admin-table-col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={5}>No courses found.</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id}>
                    <td>{row.course_name}</td>
                    <td>{row.course_code ?? "—"}</td>
                    <td>{row.department}</td>
                    <td>{row.status ?? "active"}</td>
                    <td className="admin-table-col-actions">
                      <div className="admin-table-actions">
                        <button type="button" className="admin-btn icon" onClick={() => openEdit(row)} aria-label="Edit course">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn icon danger" onClick={() => setDeleteId(row.id)} aria-label="Delete course">
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

      {modal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modal === "add" ? "Add Course" : "Edit Course"}</h3>
            <form onSubmit={handleSubmit}>
              {error && <div className="admin-pill warn">{error}</div>}
              <div className="admin-form-row">
                <label>Course name</label>
                <input className="admin-input" value={form.course_name} onChange={(e) => setForm((f) => ({ ...f, course_name: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <label>Course code</label>
                <input className="admin-input" value={form.course_code} onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <label>Department</label>
                <input className="admin-input" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <label>Description</label>
                <textarea className="admin-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="admin-form-row">
                <label>Status</label>
                <select className="admin-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Course"
        message="This action cannot be undone."
        meta="Selected course will be permanently removed."
        confirmText="Delete"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminCourses;
