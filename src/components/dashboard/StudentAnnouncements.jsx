import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StudentAnnouncements = ({ limit = 8, focusAnnouncementId = null }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focusedId, setFocusedId] = useState(null);

  const userKey = user?.id || user?.email || "student";
  const readStorageKey = `student_announcements_read_${userKey}`;
  const unreadStorageKey = `student_announcements_unread_${userKey}`;

  const publishUnread = (count) => {
    try {
      localStorage.setItem(unreadStorageKey, String(count));
    } catch {
      // ignore storage failures
    }
    window.dispatchEvent(
      new CustomEvent("student-announcements-unread", {
        detail: { key: unreadStorageKey, count },
      })
    );
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(readStorageKey);
      setReadIds(saved ? JSON.parse(saved) : []);
    } catch {
      setReadIds([]);
    }
  }, [readStorageKey]);

  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        setError("");
        const res = await api.get("/announcements", { retry: { retries: 2 } });
        const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setItems(rows);

        const unreadCount = rows.filter((a) => !readIds.includes(a.id)).length;
        publishUnread(unreadCount);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.message || "Failed to load announcements.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [readIds]);

  useEffect(() => {
    if (!focusAnnouncementId) return;
    const targetId = Number(focusAnnouncementId);
    if (!Number.isFinite(targetId)) return;

    setFocusedId(targetId);

    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-announcement-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);

    const clear = setTimeout(() => setFocusedId(null), 2400);
    return () => {
      clearTimeout(timer);
      clearTimeout(clear);
    };
  }, [focusAnnouncementId, items]);

  const markAllRead = () => {
    const ids = items.map((a) => a.id);
    setReadIds(ids);
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(ids));
    } catch {
      // ignore storage failures
    }
    publishUnread(0);
  };

  if (loading) {
    return (
      <div className="cardx-body">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" style={{ height: 140 }} />
      </div>
    );
  }

  if (error) return <div className="pill warn">{error}</div>;
  if (!items.length) return <p className="muted">No announcements yet.</p>;

  const visibleItems = limit > 0 ? items.slice(0, limit) : items;

  return (
    <div className="student-announcements-stack" style={{ display: "grid", gap: 10 }}>
      <div className="student-announcements-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="button" className="button" onClick={markAllRead}>Mark all as read</button>
      </div>
      {visibleItems.map((a) => (
        <div
          key={a.id}
          data-announcement-id={a.id}
          className={`cardx student-announcement-item ${focusedId === Number(a.id) ? "announcement-focus" : ""}`}
          style={{ boxShadow: "none" }}
        >
          <div className="cardx-body" style={{ padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <strong>{a.title}</strong>
              <span className="muted" style={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                {a.published_at ? new Date(a.published_at).toLocaleDateString() : "Today"}
              </span>
            </div>
            <p className="muted" style={{ margin: "8px 0 0" }}>{a.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentAnnouncements;
