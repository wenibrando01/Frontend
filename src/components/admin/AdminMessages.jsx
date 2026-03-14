import React, { useEffect, useState } from "react";
import api from "../../services/api";

const AdminMessages = () => {
  const [students, setStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStudents = async () => {
    const res = await api.get("/admin/students", { params: { per_page: 200 } });
    const raw = res.data;
    const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    setStudents(rows);
    if (!selectedStudentId && rows[0]?.id) {
      setSelectedStudentId(String(rows[0].id));
    }
    return rows;
  };

  const loadMessages = async (studentId) => {
    const params = { per_page: 100 };
    if (studentId) params.student_id = Number(studentId);

    const res = await api.get("/admin/private-messages", { params });
    const raw = res.data;
    const rows = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    setMessages(rows);
  };

  const loadAll = async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const rows = await loadStudents();
      const targetId = studentId || selectedStudentId || String(rows[0]?.id || "");
      await loadMessages(targetId);
    } catch (err) {
      if (err.response?.status === 401) setError("Session expired. Please log in again.");
      else if (err.response?.status === 403) setError("Access denied.");
      else setError(err.response?.data?.message || "Failed to load private messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    return (
      fullName.toLowerCase().includes(q) ||
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.email || "").toLowerCase().includes(q)
    );
  });

  const onStudentChange = async (value) => {
    setSelectedStudentId(value);
    setError("");
    setSuccess("");
    await loadMessages(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/admin/private-messages", {
        recipient_student_id: Number(selectedStudentId),
        subject: subject.trim() || null,
        message: message.trim(),
      });

      setSubject("");
      setMessage("");
      setSuccess("Private message sent successfully.");
      await loadMessages(selectedStudentId);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send private message.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Private Messages</h1>
      </div>

      <p className="admin-muted" style={{ marginBottom: 12 }}>
        Send private messages to students and review message history.
      </p>

      {success && <div className="pill success" style={{ marginBottom: 10 }}>{success}</div>}
      {error && <div className="admin-pill warn">{error}</div>}

      <div className="cardx" style={{ marginBottom: 14 }}>
        <div className="cardx-body">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input
              className="admin-input"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Type student name to filter..."
            />

            <select
              className="admin-input"
              value={selectedStudentId}
              onChange={(e) => onStudentChange(e.target.value)}
              required
            >
              <option value="">Select student</option>
              {filteredStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.first_name || ""} ${s.last_name || ""}`.trim() || s.name || `Student #${s.id}`}
                </option>
              ))}
            </select>

            <input
              className="admin-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (optional)"
            />

            <textarea
              className="admin-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your private message here..."
              rows={4}
              required
              style={{ resize: "vertical" }}
            />

            <div>
              <button
                className="admin-btn primary"
                type="submit"
                disabled={saving || !selectedStudentId || !message.trim()}
              >
                {saving ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="skeleton skeleton-block" style={{ height: 220 }} />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>To</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={4}>No private messages found for this student.</td>
                </tr>
              ) : (
                messages.map((m) => {
                  const studentName = `${m.recipient_student?.first_name || ""} ${m.recipient_student?.last_name || ""}`.trim();
                  return (
                    <tr key={m.id}>
                      <td>{studentName || m.recipient_student?.name || `Student #${m.recipient_student_id}`}</td>
                      <td>{m.subject || "(No subject)"}</td>
                      <td>{m.message || "-"}</td>
                      <td>{m.sent_at ? new Date(m.sent_at).toLocaleString() : "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
