import React, { useEffect, useState } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import api from "../../services/api";
import ConfirmDialog from "../common/ConfirmDialog";

const toDateTimeLocalValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AdminAnnouncements = () => {
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/admin/announcements", {
          params: { search: search || undefined, per_page: 100 },
        });
        const raw = res.data;
        const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        setAnnouncements(rows);
      } catch (err) {
        if (err.response?.status === 401) setError("Session expired. Please log in again.");
        else if (err.response?.status === 403) setError("Access denied.");
        else setError("Failed to load announcements.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search]);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setIsPublished(true);
    setIsPinned(false);
    setPublishedAt("");
    setEditingId(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || saving) return;

    setSaving(true);
    setError("");
    const payload = {
      title: title.trim(),
      message: message.trim(),
      is_published: isPublished,
      is_pinned: isPinned,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
    };

    try {
      if (editingId) {
        await api.patch(`/admin/announcements/${editingId}`, payload);
      } else {
        await api.post("/admin/announcements", payload);
      }
      resetForm();
      const res = await api.get("/admin/announcements", { params: { per_page: 100 } });
      const raw = res.data;
      setAnnouncements(Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setTitle(a.title || "");
    setMessage(a.message || "");
    setIsPublished(Boolean(a.is_published));
    setIsPinned(Boolean(a.is_pinned));
    setPublishedAt(toDateTimeLocalValue(a.published_at));
  };

  const removeAnnouncement = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) resetForm();
      setDeleteId(null);
    } catch {
      setError("Failed to delete announcement.");
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Announcements</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        Post announcements for students. Announcements are stored in the backend database.
      </p>

      <div className="admin-toolbar">
        <div className="admin-search-wrap" style={{ maxWidth: 340 }}>
          <Search size={18} />
          <input
            type="search"
            className="admin-input"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="admin-pill warn">{error}</div>}

      <div className="admin-settings-card" style={{ marginBottom: 16 }}>
        <h2 className="admin-settings-title">{editingId ? "Edit Announcement" : "Create Announcement"}</h2>
        <form onSubmit={onSubmit}>
          <div className="admin-form-row">
            <label>Title</label>
            <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midterm Exam Schedule" />
          </div>
          <div className="admin-form-row">
            <label>Message</label>
            <textarea className="admin-input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your announcement..." />
          </div>
          <div className="admin-form-row">
            <label>Publish date and time (optional)</label>
            <input
              type="datetime-local"
              className="admin-input"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </div>
          <div className="admin-form-row" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              Published
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              Pinned
            </label>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="admin-btn primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update announcement" : "Post announcement"}
            </button>
            {editingId && (
              <button type="button" className="admin-btn" onClick={resetForm}>Cancel edit</button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 180 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Status</th>
                <th>Posted</th>
                <th className="admin-table-col-actions"></th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={5}>No announcements yet.</td>
                </tr>
              ) : (
                announcements.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.message}</td>
                    <td>
                      {a.is_published ? "Published" : "Draft"}
                      {a.is_pinned ? " • Pinned" : ""}
                    </td>
                    <td>{a.published_at ? new Date(a.published_at).toLocaleString() : "-"}</td>
                    <td className="admin-table-col-actions">
                      <div className="admin-table-actions">
                        <button type="button" className="admin-btn icon" onClick={() => startEdit(a)} aria-label="Edit announcement">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="admin-btn icon danger" onClick={() => setDeleteId(a.id)} aria-label="Delete announcement">
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

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Announcement"
        message="This action cannot be undone."
        meta="The selected announcement will be permanently deleted."
        confirmText="Delete"
        onConfirm={() => removeAnnouncement(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminAnnouncements;
