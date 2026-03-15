import React from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StudentMessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [markingRead, setMarkingRead] = React.useState(false);
  const [error, setError] = React.useState("");

  const userKey = user?.id || user?.email || "student";
  const unreadMessagesStorageKey = `student_private_messages_unread_${userKey}`;

  const publishUnreadMessages = React.useCallback((count) => {
    try {
      localStorage.setItem(unreadMessagesStorageKey, String(count));
    } catch {
      // ignore storage failures
    }

    window.dispatchEvent(
      new CustomEvent("student-private-messages-unread", {
        detail: { key: unreadMessagesStorageKey, count },
      })
    );
  }, [unreadMessagesStorageKey]);

  const loadInbox = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/student/private-messages");
      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      const unread = Number(res.data?.unread_count || 0);
      setMessages(rows);
      setUnreadCount(Number.isFinite(unread) ? unread : 0);
      publishUnreadMessages(Number.isFinite(unread) ? unread : 0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load private messages.");
      setMessages([]);
      setUnreadCount(0);
      publishUnreadMessages(0);
    } finally {
      setLoading(false);
    }
  }, [publishUnreadMessages]);

  React.useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const markAllRead = async () => {
    const unreadIds = messages
      .filter((m) => !m.is_read)
      .map((m) => m.id)
      .filter((id) => Number.isFinite(Number(id)));

    if (unreadIds.length === 0) return;

    setMarkingRead(true);
    setError("");
    try {
      await api.post("/student/private-messages/mark-read", { ids: unreadIds });
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      setUnreadCount(0);
      publishUnreadMessages(0);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark messages as read.");
    } finally {
      setMarkingRead(false);
    }
  };

  const senderLabel = (m) => {
    const first = m.sender?.first_name || "";
    const last = m.sender?.last_name || "";
    const full = `${first} ${last}`.trim();
    return full || m.sender?.name || m.sender?.username || m.sender?.email || "Admin";
  };

  return (
    <div className="educo-content">
      <div className="cardx span-2">
        <div className="cardx-header" style={{ justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="cardx-title">Private Messages</div>
            <div className="cardx-description muted">Messages sent by admins to your account</div>
          </div>
          <button
            type="button"
            className="admin-btn ghost"
            onClick={markAllRead}
            disabled={markingRead || unreadCount === 0}
          >
            {markingRead ? "Updating..." : unreadCount > 0 ? `Mark all as read (${unreadCount})` : "All caught up"}
          </button>
        </div>

        <div className="cardx-body">
          {error && <div className="admin-pill warn" style={{ marginBottom: 10 }}>{error}</div>}

          {loading ? (
            <div className="skeleton skeleton-block" style={{ height: 220 }} />
          ) : (
            <div className="admin-table-wrap" style={{ marginTop: 4 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Sent At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={5}>No private messages yet.</td>
                    </tr>
                  ) : (
                    messages.map((m) => (
                      <tr key={m.id}>
                        <td>{senderLabel(m)}</td>
                        <td>{m.subject || "(No subject)"}</td>
                        <td>{m.message || "-"}</td>
                        <td>{m.sent_at ? new Date(m.sent_at).toLocaleString() : "-"}</td>
                        <td>{m.is_read ? "Read" : "Unread"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessagesPage;
