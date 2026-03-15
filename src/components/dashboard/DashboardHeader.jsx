import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, MessageCircle, User, Settings, LogOut, Palette, Menu } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ConfirmDialog from "../common/ConfirmDialog";

const DashboardHeader = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [privateMessages, setPrivateMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [deleteAllAnnouncementsConfirmOpen, setDeleteAllAnnouncementsConfirmOpen] = useState(false);
  const [deleteAllMessagesConfirmOpen, setDeleteAllMessagesConfirmOpen] = useState(false);
  const dropdownRef = useRef(null);
  const announcementsRef = useRef(null);
  const messagesRef = useRef(null);
  const searchRef = useRef(null);

  const baseSearchRoutes = [
    {
      id: "dashboard",
      label: "Dashboard Home",
      hint: "Overview, charts, weather, announcements",
      keywords: ["home", "overview", "chart", "summary"],
      action: () => navigate("/dashboard"),
    },
    {
      id: "profile",
      label: "Profile",
      hint: "Update your personal details",
      keywords: ["user", "account", "name", "email"],
      action: () => navigate("/dashboard/profile"),
    },
    {
      id: "enrollment",
      label: "Enrollment",
      hint: "Enroll subjects and manage schedule options",
      keywords: ["enroll", "subject", "class", "register"],
      action: () => navigate("/dashboard/enrollment"),
    },
    {
      id: "courses",
      label: "My Courses",
      hint: "View your assigned courses",
      keywords: ["course", "subjects", "classlist"],
      action: () => navigate("/dashboard/my-courses"),
    },
    {
      id: "grades",
      label: "Grades",
      hint: "Check your latest grades",
      keywords: ["gwa", "score", "marks", "result"],
      action: () => navigate("/dashboard/grades"),
    },
    {
      id: "schedule",
      label: "Schedule",
      hint: "See class and session schedules",
      keywords: ["calendar", "time", "routine", "class time"],
      action: () => navigate("/dashboard/schedule"),
    },
    {
      id: "events",
      label: "Events",
      hint: "School events and activities",
      keywords: ["activities", "holiday", "program"],
      action: () => navigate("/dashboard/events"),
    },
    {
      id: "announcements",
      label: "Announcements",
      hint: "Latest updates from admin",
      keywords: ["notice", "news", "bulletin"],
      action: () => navigate("/dashboard/announcements"),
    },
    {
      id: "settings",
      label: "Settings",
      hint: "Password, profile, and preferences",
      keywords: ["password", "preference", "theme", "account settings"],
      action: () => navigate("/dashboard/settings"),
    },
    {
      id: "messages",
      label: "Private Messages",
      hint: "Open the message panel from admin",
      keywords: ["chat", "inbox", "message"],
      action: () => setMessagesOpen(true),
    },
  ];

  const normalizedSearch = searchText.trim().toLowerCase();
  const shortenSearchHint = (text, max = 68) => {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}...`;
  };

  const contentSearchItems = useMemo(() => {
    if (!normalizedSearch) return [];

    const announcementItems = (announcements || [])
      .filter((a) => {
        const hay = `${a.title || ""} ${a.message || ""}`.toLowerCase();
        return hay.includes(normalizedSearch);
      })
      .slice(0, 3)
      .map((a) => ({
        id: `announcement-${a.id}`,
        label: `Announcement: ${a.title || "Untitled"}`,
        hint: shortenSearchHint(a.message || "Open announcement details", 68),
        action: () => navigate("/dashboard/announcements", { state: { focusAnnouncementId: a.id } }),
      }));

    const messageItems = (privateMessages || [])
      .filter((m) => {
        const hay = `${m.subject || ""} ${m.message || ""}`.toLowerCase();
        return hay.includes(normalizedSearch);
      })
      .slice(0, 3)
      .map((m) => ({
        id: `message-${m.id}`,
        label: `Message: ${m.subject || "(No subject)"}`,
        hint: shortenSearchHint(m.message || "Open message panel", 68),
        action: async () => {
          setMessagesOpen(true);
          const { rows, unread } = await loadPrivateMessages();
          if (unread > 0) await markMessagesRead(rows);
        },
      }));

    return [...announcementItems, ...messageItems];
  }, [announcements, privateMessages, normalizedSearch, navigate]);

  const searchResults = useMemo(() => {
    const routeItems = baseSearchRoutes.filter((item) => {
      if (!normalizedSearch) return true;
      const haystack = [item.label, item.hint, ...(item.keywords || [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
    return [...routeItems, ...contentSearchItems];
  }, [baseSearchRoutes, contentSearchItems, normalizedSearch]);

  const activeUser = user || authUser;
  const userKey = activeUser?.id || activeUser?.email || "student";
  const readStorageKey = `student_announcements_read_${userKey}`;
  const unreadStorageKey = `student_announcements_unread_${userKey}`;
  const unreadMessagesStorageKey = `student_private_messages_unread_${userKey}`;
  const dismissedAnnouncementsKey = `student_announcements_dismissed_${userKey}`;
  const dismissedPrivateMessagesKey = `student_private_messages_dismissed_${userKey}`;
  const latestAnnouncementIdRef = useRef(0);
  const latestMessageIdRef = useRef(0);
  const previousAnnouncementUnreadRef = useRef(0);
  const previousMessageUnreadRef = useRef(0);
  const pollingInitializedRef = useRef(false);
  const [dismissedAnnouncementIds, setDismissedAnnouncementIds] = useState([]);
  const [dismissedPrivateMessageIds, setDismissedPrivateMessageIds] = useState([]);

  const pushToast = (title, text) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, text }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const getReadAnnouncementIds = () => {
    try {
      const saved = localStorage.getItem(readStorageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const getDismissedAnnouncementIds = () => {
    try {
      const saved = localStorage.getItem(dismissedAnnouncementsKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x)) : [];
    } catch {
      return [];
    }
  };

  const persistDismissedAnnouncementIds = (ids) => {
    try {
      localStorage.setItem(dismissedAnnouncementsKey, JSON.stringify(ids));
    } catch {
      // ignore storage failures
    }
  };

  const getDismissedPrivateMessageIds = () => {
    try {
      const saved = localStorage.getItem(dismissedPrivateMessagesKey);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x)) : [];
    } catch {
      return [];
    }
  };

  const persistDismissedPrivateMessageIds = (ids) => {
    try {
      localStorage.setItem(dismissedPrivateMessagesKey, JSON.stringify(ids));
    } catch {
      // ignore storage failures
    }
  };

  const publishUnreadAnnouncements = (count) => {
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

  const publishUnreadMessages = (count) => {
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
  };

  const loadAnnouncementsPreview = async ({ silent = false, notify = false } = {}) => {
    if (!silent) setAnnouncementsLoading(true);
    if (!silent) setAnnouncementsError("");
    try {
      const res = await api.get("/announcements", { retry: { retries: 2 } });
      const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const dismissedIds = getDismissedAnnouncementIds();
      const visibleRows = rows.filter((a) => !dismissedIds.includes(Number(a?.id)));
      setAnnouncements(visibleRows);

      const readIds = getReadAnnouncementIds();
      const unreadCount = visibleRows.filter((a) => !readIds.includes(a.id)).length;
      setUnreadAnnouncements(unreadCount);
      publishUnreadAnnouncements(unreadCount);

      const latestId = Number(visibleRows[0]?.id || 0);
      if (
        notify &&
        pollingInitializedRef.current &&
        latestId > latestAnnouncementIdRef.current &&
        unreadCount > previousAnnouncementUnreadRef.current
      ) {
        const newest = visibleRows[0];
        pushToast(
          "New announcement",
          newest?.title || "An admin posted a new announcement."
        );
      }
      latestAnnouncementIdRef.current = latestId;
      previousAnnouncementUnreadRef.current = unreadCount;

      return { rows: visibleRows, unreadCount };
    } catch (err) {
      if (!silent) {
        setAnnouncementsError(err.response?.data?.message || "Failed to load announcements.");
      }
      return { rows: [], unreadCount: 0 };
    } finally {
      if (!silent) setAnnouncementsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        const data = res.data?.user ?? res.data;
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const loadPrivateMessages = async ({ silent = false, notify = false } = {}) => {
    if (!silent) setMessagesLoading(true);
    if (!silent) setMessagesError("");
    try {
      const res = await api.get("/student/private-messages");
      const rows = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      const dismissedIds = getDismissedPrivateMessageIds();
      const visibleRows = rows.filter((m) => !dismissedIds.includes(Number(m?.id)));
      setPrivateMessages(visibleRows);
      const unread = visibleRows.filter((m) => m && m.is_read === false).length;
      setUnreadMessages(unread);
      publishUnreadMessages(unread);

      const latestId = Number(visibleRows[0]?.id || 0);
      if (
        notify &&
        pollingInitializedRef.current &&
        latestId > latestMessageIdRef.current &&
        unread > previousMessageUnreadRef.current
      ) {
        const newest = visibleRows[0];
        pushToast(
          "New private message",
          newest?.subject || "Admin sent you a new private message."
        );
      }
      latestMessageIdRef.current = latestId;
      previousMessageUnreadRef.current = unread;
      return { rows: visibleRows, unread };
    } catch (err) {
      if (!silent) {
        setMessagesError(err.response?.data?.message || "Failed to load private messages.");
      }
      return { rows: [], unread: 0 };
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const markMessagesRead = async (rows) => {
    const unreadIds = (rows || [])
      .filter((m) => m && m.is_read === false)
      .map((m) => m.id)
      .filter((id) => Number.isFinite(Number(id)));

    if (unreadIds.length === 0) return;

    try {
      await api.post("/student/private-messages/mark-read", { ids: unreadIds });
      setUnreadMessages(0);
      setPrivateMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      publishUnreadMessages(0);
    } catch {
      // Keep current UI state if mark-read fails.
    }
  };

  const markAnnouncementsRead = () => {
    const ids = (announcements || [])
      .map((a) => Number(a?.id))
      .filter((id) => Number.isFinite(id));

    try {
      localStorage.setItem(readStorageKey, JSON.stringify(ids));
    } catch {
      // ignore storage failures
    }

    setUnreadAnnouncements(0);
    previousAnnouncementUnreadRef.current = 0;
    publishUnreadAnnouncements(0);
  };

  const markAnnouncementRead = (id) => {
    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return;

    const existing = getReadAnnouncementIds();
    if (existing.includes(targetId)) return;

    const nextIds = [...existing, targetId];
    try {
      localStorage.setItem(readStorageKey, JSON.stringify(nextIds));
    } catch {
      // ignore storage failures
    }

    const nextUnread = Math.max(
      0,
      (announcements || []).filter((a) => !nextIds.includes(Number(a?.id))).length
    );
    setUnreadAnnouncements(nextUnread);
    previousAnnouncementUnreadRef.current = nextUnread;
    publishUnreadAnnouncements(nextUnread);
  };

  const markOneMessageRead = async (id) => {
    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return;

    try {
      await api.post("/student/private-messages/mark-read", { ids: [targetId] });
      setPrivateMessages((prev) =>
        prev.map((m) => (Number(m.id) === targetId ? { ...m, is_read: true } : m))
      );
      const nextUnread = Math.max(0, unreadMessages - 1);
      setUnreadMessages(nextUnread);
      publishUnreadMessages(nextUnread);
      previousMessageUnreadRef.current = nextUnread;
    } catch {
      // Keep UI state when mark-read fails.
    }
  };

  const markAllMessagesRead = async () => {
    const unreadIds = (privateMessages || [])
      .filter((m) => m && m.is_read === false)
      .map((m) => Number(m.id))
      .filter((id) => Number.isFinite(id));

    if (unreadIds.length === 0) return;

    try {
      await api.post("/student/private-messages/mark-read", { ids: unreadIds });
      setPrivateMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      setUnreadMessages(0);
      publishUnreadMessages(0);
      previousMessageUnreadRef.current = 0;
    } catch {
      // Keep UI state when mark-read fails.
    }
  };

  useEffect(() => {
    loadPrivateMessages();
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    if (announcements.length === 0) {
      loadAnnouncementsPreview();
    }
    if (privateMessages.length === 0) {
      loadPrivateMessages();
    }
  }, [searchOpen]);

  useEffect(() => {
    setDismissedAnnouncementIds(getDismissedAnnouncementIds());
  }, [dismissedAnnouncementsKey]);

  useEffect(() => {
    setDismissedPrivateMessageIds(getDismissedPrivateMessageIds());
  }, [dismissedPrivateMessagesKey]);

  useEffect(() => {
    loadAnnouncementsPreview();
    const syncUnread = () => {
      try {
        const value = Number(localStorage.getItem(unreadStorageKey) || 0);
        setUnreadAnnouncements(Number.isFinite(value) ? value : 0);
      } catch {
        setUnreadAnnouncements(0);
      }
    };

    const onUnreadEvent = (e) => {
      if (e?.detail?.key === unreadStorageKey) {
        setUnreadAnnouncements(e.detail.count || 0);
      }
    };

    syncUnread();
    window.addEventListener("storage", syncUnread);
    window.addEventListener("student-announcements-unread", onUnreadEvent);

    return () => {
      window.removeEventListener("storage", syncUnread);
      window.removeEventListener("student-announcements-unread", onUnreadEvent);
    };
  }, [unreadStorageKey]);

  const dismissAnnouncementNotification = (id) => {
    const targetId = Number(id);
    if (!Number.isFinite(targetId)) return;

    const nextDismissed = dismissedAnnouncementIds.includes(targetId)
      ? dismissedAnnouncementIds
      : [...dismissedAnnouncementIds, targetId];

    setDismissedAnnouncementIds(nextDismissed);
    persistDismissedAnnouncementIds(nextDismissed);

    const readIds = getReadAnnouncementIds();
    const wasUnread = announcements.some((a) => Number(a?.id) === targetId && !readIds.includes(a.id));
    const nextAnnouncements = announcements.filter((a) => Number(a?.id) !== targetId);
    setAnnouncements(nextAnnouncements);

    if (wasUnread) {
      const nextUnread = Math.max(0, unreadAnnouncements - 1);
      setUnreadAnnouncements(nextUnread);
      previousAnnouncementUnreadRef.current = nextUnread;
      publishUnreadAnnouncements(nextUnread);
    }
  };

  const dismissAllPrivateMessagesNotifications = () => {
    const idsToDismiss = (privateMessages || [])
      .map((m) => Number(m?.id))
      .filter((id) => Number.isFinite(id));

    if (idsToDismiss.length === 0) {
      setDeleteAllMessagesConfirmOpen(false);
      return;
    }

    const nextDismissed = Array.from(new Set([...dismissedPrivateMessageIds, ...idsToDismiss]));
    setDismissedPrivateMessageIds(nextDismissed);
    persistDismissedPrivateMessageIds(nextDismissed);

    setPrivateMessages([]);
    setUnreadMessages(0);
    previousMessageUnreadRef.current = 0;
    publishUnreadMessages(0);
    setDeleteAllMessagesConfirmOpen(false);
  };

  const dismissAllAnnouncementNotifications = () => {
    const idsToDismiss = (announcements || [])
      .map((a) => Number(a?.id))
      .filter((id) => Number.isFinite(id));

    if (idsToDismiss.length === 0) {
      setDeleteAllAnnouncementsConfirmOpen(false);
      return;
    }

    const nextDismissed = Array.from(new Set([...dismissedAnnouncementIds, ...idsToDismiss]));
    setDismissedAnnouncementIds(nextDismissed);
    persistDismissedAnnouncementIds(nextDismissed);

    setAnnouncements([]);
    setUnreadAnnouncements(0);
    previousAnnouncementUnreadRef.current = 0;
    publishUnreadAnnouncements(0);
    setDeleteAllAnnouncementsConfirmOpen(false);
  };

  useEffect(() => {
    const syncUnread = () => {
      try {
        const value = Number(localStorage.getItem(unreadMessagesStorageKey) || 0);
        setUnreadMessages(Number.isFinite(value) ? value : 0);
      } catch {
        setUnreadMessages(0);
      }
    };

    const onUnreadEvent = (e) => {
      if (e?.detail?.key === unreadMessagesStorageKey) {
        setUnreadMessages(e.detail.count || 0);
      }
    };

    syncUnread();
    window.addEventListener("storage", syncUnread);
    window.addEventListener("student-private-messages-unread", onUnreadEvent);

    return () => {
      window.removeEventListener("storage", syncUnread);
      window.removeEventListener("student-private-messages-unread", onUnreadEvent);
    };
  }, [unreadMessagesStorageKey]);

  useEffect(() => {
    let cancelled = false;

    const poll = async (notify) => {
      await Promise.all([
        loadAnnouncementsPreview({ silent: true, notify }),
        loadPrivateMessages({ silent: true, notify }),
      ]);
      if (!cancelled && !pollingInitializedRef.current) {
        pollingInitializedRef.current = true;
      }
    };

    poll(false);
    const id = window.setInterval(() => poll(true), 20000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [readStorageKey, unreadStorageKey, unreadMessagesStorageKey]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (announcementsRef.current && !announcementsRef.current.contains(e.target)) {
        setAnnouncementsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(e.target)) {
        setMessagesOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const displayName =
    user?.first_name || user?.last_name
      ? [user.first_name, user.last_name].filter(Boolean).join(" ")
      : user?.name || user?.username || user?.email || "Student";
  const role = user?.role || "student";

  const handleLogout = () => {
    setDropdownOpen(false);
    setLogoutConfirmOpen(true);
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    navigate("/dashboard/settings");
  };

  const handleAnnouncementsClick = async () => {
    const next = !announcementsOpen;
    setAnnouncementsOpen(next);
    if (next) {
      await loadAnnouncementsPreview();
    }
  };

  const handleOpenAnnouncementsPage = () => {
    markAnnouncementsRead();
    setAnnouncementsOpen(false);
    navigate("/dashboard/announcements");
  };

  const handleMessagesClick = async () => {
    const next = !messagesOpen;
    setMessagesOpen(next);
    if (next) {
      await loadPrivateMessages();
    }
  };

  const runSearchAction = async (item) => {
    if (!item) return;
    setSearchOpen(false);
    setSearchText("");
    if (item.id === "messages") {
      setMessagesOpen(true);
      await loadPrivateMessages();
      return;
    }
    await item.action();
  };

  const onSearchKeyDown = async (e) => {
    if (e.key === "Escape") {
      setSearchOpen(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      await runSearchAction(searchResults[0]);
    }
  };

  const adminName = (sender) => {
    if (!sender) return "Admin";
    if (sender.first_name || sender.last_name) {
      return [sender.first_name, sender.last_name].filter(Boolean).join(" ");
    }
    return sender.name || sender.username || sender.email || "Admin";
  };

  const shortText = (text, max = 86) => {
    const value = String(text || "").trim();
    if (value.length <= max) return value;
    return `${value.slice(0, max).trim()}...`;
  };

  return (
    <>
    {toasts.length > 0 && (
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1400, display: "grid", gap: 8 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="cardx"
            style={{ minWidth: 260, maxWidth: 360, borderColor: "rgba(59,130,246,0.32)" }}
          >
            <div className="cardx-body" style={{ padding: 10 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{t.title}</div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>{shortText(t.text, 88)}</div>
            </div>
          </div>
        ))}
      </div>
    )}
    <header className="educo-header">
      <div className="educo-header-left">
        <h1 className="educo-header-welcome">Welcome Back 👋</h1>
      </div>
      <div className="educo-header-search-wrap" ref={searchRef}>
        <Search size={18} className="educo-header-search-icon" />
        <input
          type="search"
          placeholder="Find anything: grades, enrollment, announcements, settings..."
          className="educo-header-search"
          aria-label="System guide search"
          value={searchText}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setSearchText(e.target.value);
            setSearchOpen(true);
          }}
          onKeyDown={onSearchKeyDown}
        />
        {searchOpen && (
          <div className="educo-header-search-panel">
            <div className="educo-header-search-title">Quick Guide</div>
            {searchResults.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>No matches. Try: grades, enrollment, announcements, profile.</p>
            ) : (
              <div className="educo-header-search-list">
                {searchResults.slice(0, 6).map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="educo-header-search-item"
                    onClick={() => runSearchAction(item)}
                  >
                    <span className="educo-header-search-item-label">{item.label}</span>
                    <span className="educo-header-search-item-hint">{item.hint}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="educo-header-search-footer">Press Enter to open first result</div>
          </div>
        )}
      </div>
      <div className="educo-header-right">
        <div className="educo-header-messages-wrap" ref={announcementsRef}>
          <button
            type="button"
            className="educo-header-icon-btn"
            aria-label="Notifications"
            onClick={handleAnnouncementsClick}
          >
            <Bell size={20} />
            {unreadAnnouncements > 0 && <span className="educo-header-badge" />}
          </button>

          {announcementsOpen && (
            <div className="educo-header-messages-panel">
              <div className="educo-header-messages-title">Announcements</div>
              {announcementsLoading && <p className="muted" style={{ margin: 0 }}>Loading announcements...</p>}
              {!announcementsLoading && announcementsError && <div className="pill warn">{announcementsError}</div>}

              {!announcementsLoading && !announcementsError && announcements.length === 0 && (
                <p className="muted" style={{ margin: 0 }}>No announcements right now.</p>
              )}

              {!announcementsLoading && !announcementsError && announcements.length > 0 && (
                <div className="educo-header-messages-list">
                  {announcements.slice(0, 4).map((a) => (
                    <div key={a.id} className="educo-header-message-item">
                      <div className="educo-header-message-top">
                        <strong>{a.title || "Announcement"}</strong>
                        <span className="muted">
                          {a.published_at ? new Date(a.published_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="muted" style={{ margin: "6px 0" }}>{shortText(a.message)}</p>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="educo-notification-delete"
                          onClick={() => dismissAnnouncementNotification(a.id)}
                        >
                          Delete
                        </button>
                      </div>
                      {!getReadAnnouncementIds().includes(Number(a.id)) ? (
                        <button
                          type="button"
                          className="button"
                          style={{ marginTop: 4 }}
                          onClick={() => markAnnouncementRead(a.id)}
                        >
                          Mark this as read
                        </button>
                      ) : (
                        <div className="muted" style={{ fontSize: 12 }}>Read</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button
                  type="button"
                  className="button"
                  onClick={() => setDeleteAllAnnouncementsConfirmOpen(true)}
                  disabled={announcements.length === 0}
                >
                  Delete all
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={markAnnouncementsRead}
                  disabled={unreadAnnouncements === 0}
                >
                  {unreadAnnouncements > 0 ? "Mark all as read" : "Marked as read"}
                </button>
                <button type="button" className="button" onClick={handleOpenAnnouncementsPage}>
                  View all announcements
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="educo-header-messages-wrap" ref={messagesRef}>
          <button
            type="button"
            className="educo-header-icon-btn"
            aria-label="Messages"
            onClick={handleMessagesClick}
          >
            <MessageCircle size={20} />
            {unreadMessages > 0 && <span className="educo-header-badge" />}
          </button>

          {messagesOpen && (
            <div className="educo-header-messages-panel">
              <div className="educo-header-messages-title">Admin Private Messages</div>
              {messagesLoading && <p className="muted" style={{ margin: 0 }}>Loading messages...</p>}
              {!messagesLoading && messagesError && <div className="pill warn">{messagesError}</div>}

              {!messagesLoading && !messagesError && privateMessages.length === 0 && (
                <p className="muted" style={{ margin: 0 }}>No private messages from admin yet.</p>
              )}

              {!messagesLoading && !messagesError && privateMessages.length > 0 && (
                <div className="educo-header-messages-list">
                  {privateMessages.map((m) => (
                    <div key={m.id} className="educo-header-message-item">
                      <div className="educo-header-message-top">
                        <strong>{m.subject || "Message from Admin"}</strong>
                        <span className="muted">
                          {m.sent_at ? new Date(m.sent_at).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="muted" style={{ margin: "6px 0" }}>{m.message}</p>
                      <div className="muted" style={{ fontSize: 12 }}>By {adminName(m.sender)}</div>
                      {!m.is_read ? (
                        <button
                          type="button"
                          className="button"
                          style={{ marginTop: 6 }}
                          onClick={() => markOneMessageRead(m.id)}
                        >
                          Mark this as read
                        </button>
                      ) : (
                        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Read</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!messagesLoading && !messagesError && privateMessages.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setDeleteAllMessagesConfirmOpen(true)}
                  >
                    Delete all
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={markAllMessagesRead}
                    disabled={unreadMessages === 0}
                    style={{ marginLeft: 8 }}
                  >
                    {unreadMessages > 0 ? "Mark all as read" : "Marked as read"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          className="educo-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
        >
          <Menu size={18} />
        </button>
        <div className="educo-header-profile-wrap" ref={dropdownRef}>
          <button
            type="button"
            className="educo-header-user educo-header-user-btn"
            onClick={() => setDropdownOpen((o) => !o)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="educo-header-avatar">
              <User size={22} />
            </div>
            <div className="educo-header-user-info">
              <span className="educo-header-user-name">{displayName}</span>
              <span className="educo-header-user-role">{role}</span>
            </div>
          </button>
          {dropdownOpen && (
            <div className="educo-header-dropdown">
              <div className="educo-header-dropdown-section">
                <span className="educo-header-dropdown-label">Display & Accessibility</span>
                <div className="educo-header-dropdown-row">
                  <Palette size={18} />
                  <span>Dark mode</span>
                  <button
                    type="button"
                    className={`educo-toggle ${theme === "dark" ? "on" : ""}`}
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    <span className="educo-toggle-track" />
                    <span className="educo-toggle-thumb" />
                  </button>
                </div>
              </div>
              <button type="button" className="educo-header-dropdown-item" onClick={handleSettings}>
                <Settings size={18} />
                <span>Settings</span>
              </button>
              <button type="button" className="educo-header-dropdown-item danger" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <ConfirmDialog
      open={deleteAllAnnouncementsConfirmOpen}
      title="Delete All Notifications"
      message="Are you sure you want to delete all announcements?"
      meta="This will remove all current announcement notifications from this panel for your account."
      confirmText="Delete all"
      onConfirm={dismissAllAnnouncementNotifications}
      onCancel={() => setDeleteAllAnnouncementsConfirmOpen(false)}
    />
    <ConfirmDialog
      open={deleteAllMessagesConfirmOpen}
      title="Delete All Private Messages"
      message="Are you sure you want to delete all private messages?"
      meta="This will remove all current private message notifications from this panel for your account."
      confirmText="Delete all"
      onConfirm={dismissAllPrivateMessagesNotifications}
      onCancel={() => setDeleteAllMessagesConfirmOpen(false)}
    />
    <ConfirmDialog
      open={logoutConfirmOpen}
      title="Log Out"
      message="Are you sure you want to log out?"
      meta="You can sign back in anytime."
      confirmText="Log out"
      onConfirm={() => {
        logout();
        navigate("/student/login", { replace: true });
        setLogoutConfirmOpen(false);
      }}
      onCancel={() => setLogoutConfirmOpen(false)}
    />
    </>
  );
};

export default DashboardHeader;
