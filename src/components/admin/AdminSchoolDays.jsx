import React, { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";

const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const fmtTime = (t) => (t ? String(t).slice(0, 5) : "");

const AdminSchoolDays = () => {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    description: "",
    attendance_rate: 0,
    is_holiday: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const loadDays = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/school-days", { params: { search: search || undefined, per_page: 50 } });
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
    loadDays();
  }, [search]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("add") === "1") {
      setForm({ date: "", start_time: "", end_time: "", description: "", attendance_rate: 0, is_holiday: false });
      setModal("add");
    }
  }, []);

  const openEdit = (row) => {
    setForm({
      date: fmtDate(row.date),
      start_time: fmtTime(row.start_time),
      end_time: fmtTime(row.end_time),
      description: row.description ?? "",
      attendance_rate: row.attendance_rate ?? 0,
      is_holiday: Boolean(row.is_holiday),
    });
    setModal(row.id);
    setError("");
  };

  const openAdd = () => {
    setForm({ date: "", start_time: "", end_time: "", description: "", attendance_rate: 0, is_holiday: false });
    setModal("add");
    setError("");
  };

  const closeModal = () => setModal(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form };
    if (!payload.start_time) delete payload.start_time;
    if (!payload.end_time) delete payload.end_time;
    try {
      if (modal === "add") {
        await api.post("/admin/school-days", payload);
      } else {
        await api.patch("/admin/school-days/" + modal, payload);
      }
      closeModal();
      loadDays();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete("/admin/school-days/" + id);
      loadDays();
      setDeleteId(null);
    } catch {
      setError("Failed to delete.");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">School Days</h1>
        <button type="button" className="admin-btn primary" onClick={openAdd}>
          <Plus size={18} /> Add School Day
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-wrap">
          <Search size={18} />
          <input type="search" placeholder="Search date, day, number, or description..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input" />
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
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Description</th>
                <th>Attendance %</th>
                <th>Holiday</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={7}>No school days found.</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id}>
                    <td>{fmtDate(row.date)}</td>
                    <td>{fmtTime(row.start_time) || "—"}</td>
                    <td>{fmtTime(row.end_time) || "—"}</td>
                    <td>{row.description || "—"}</td>
                    <td>{row.attendance_rate ?? 0}%</td>
                    <td>{row.is_holiday ? "Yes" : "No"}</td>
                    <td>
                      <button type="button" className="admin-btn icon" onClick={() => openEdit(row)}><Pencil size={16} /></button>
                      <button type="button" className="admin-btn icon danger" onClick={() => setDeleteId(row.id)}><Trash2 size={16} /></button>
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
            <h3>{modal === "add" ? "Add School Day" : "Edit School Day"}</h3>
            <form onSubmit={handleSubmit}>
              {error && <div className="admin-pill warn">{error}</div>}
              <div className="admin-form-row">
                <label>Date</label>
                <input type="date" className="admin-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
              </div>
              <div className="admin-form-row">
                <label>Start time</label>
                <input type="time" className="admin-input" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <label>End time</label>
                <input type="time" className="admin-input" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <label>Description</label>
                <input className="admin-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="admin-form-row">
                <label>Attendance rate %</label>
                <input type="number" min={0} max={100} className="admin-input" value={form.attendance_rate} onChange={(e) => setForm((f) => ({ ...f, attendance_rate: +e.target.value || 0 }))} />
              </div>
              <div className="admin-form-row">
                <label>
                  <input type="checkbox" checked={form.is_holiday} onChange={(e) => setForm((f) => ({ ...f, is_holiday: e.target.checked }))} />
                  Holiday
                </label>
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
        title="Delete School Day"
        message="This action cannot be undone."
        meta="The selected school day record will be removed."
        confirmText="Delete"
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminSchoolDays;
