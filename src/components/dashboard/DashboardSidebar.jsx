import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  Bell,
  Settings,
  LogOut,
  BookMarked,
  GraduationCap,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/profile", label: "Profile", icon: Users },
  { path: "/dashboard/enrollment", label: "Enrollment", icon: ClipboardList },
  { path: "/dashboard/my-courses", label: "My Courses", icon: BookOpen },
  { path: "/dashboard/grades", label: "Grades", icon: GraduationCap },
  { path: "/dashboard/schedule", label: "Schedule", icon: CalendarDays },
  { path: "/dashboard/events", label: "Events", icon: Calendar },
  { path: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
];

const bottomItems = [
  { path: "/dashboard/settings", label: "Settings", icon: Settings },
  { path: null, label: "Logout", icon: LogOut, action: "logout" },
];

const DashboardSidebar = ({ isOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [unreadAnnouncements, setUnreadAnnouncements] = React.useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);

  const userKey = user?.id || user?.email || "student";
  const unreadStorageKey = `student_announcements_unread_${userKey}`;

  React.useEffect(() => {
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

  const handleNav = (item) => {
    if (item.action === "logout") {
      setLogoutConfirmOpen(true);
      return;
    }
    if (item.path?.startsWith("/")) {
      navigate(item.path);
      onClose?.();
      return;
    }
  };

  return (
    <aside className={`educo-sidebar ${isOpen ? "open" : ""}`}>
      <div className="educo-sidebar-brand">
        <div className="educo-sidebar-logo">
          <BookMarked size={28} />
        </div>
        <span className="educo-sidebar-title">Skwelahan ni brando</span>
      </div>
      <nav className="educo-sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path + item.label}
              type="button"
              className={`educo-sidebar-item ${isActive ? "active" : ""}`}
              onClick={() => handleNav(item)}
            >
              <item.icon size={20} />
              <span className="educo-sidebar-item-label">{item.label}</span>
              {item.label === "Announcements" && unreadAnnouncements > 0 && (
                <span className="educo-sidebar-badge">{unreadAnnouncements > 99 ? "99+" : unreadAnnouncements}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="educo-sidebar-bottom">
        {bottomItems.map((item) => {
          const isSettingsActive = item.path === "/dashboard/settings" && location.pathname === "/dashboard/settings";
          return (
            <button
              key={item.label}
              type="button"
              className={`educo-sidebar-item ${isSettingsActive ? "active" : ""}`}
              onClick={() => handleNav(item)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
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
          onClose?.();
        }}
        onCancel={() => setLogoutConfirmOpen(false)}
      />
    </aside>
  );
};

export default DashboardSidebar;
