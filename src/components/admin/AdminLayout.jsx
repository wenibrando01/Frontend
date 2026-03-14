import React from "react";
import { Outlet, useNavigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  CalendarDays,
  MessageCircle,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1200) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className={`admin-layout ${theme === "dark" ? "admin-theme-dark" : "admin-theme-light"}`}>
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`} style={{ overflowX: "hidden" }}>
        <div className="admin-sidebar-brand">Admin</div>
        <div className="admin-theme-switch">
          <span>Theme</span>
          <button
            type="button"
            className="admin-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>
        <nav className="admin-sidebar-nav" style={{ overflowX: "hidden" }}>
          <NavLink to="/admin/dashboard" end className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "")}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/dashboard/students" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "")}>
            <Users size={20} /> Students
          </NavLink>
          <NavLink to="/admin/dashboard/courses" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "")}>
            <BookOpen size={20} /> Courses
          </NavLink>
          <NavLink to="/admin/dashboard/enrollment" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <ClipboardList size={20} /> Enrollment
          </NavLink>
          <NavLink to="/admin/dashboard/grades" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <GraduationCap size={20} /> Grades
          </NavLink>
          <NavLink to="/admin/dashboard/events" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <Calendar size={20} /> Events
          </NavLink>
          <NavLink to="/admin/dashboard/school-days" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <CalendarDays size={20} /> School Days
          </NavLink>
          <NavLink to="/admin/dashboard/messages" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <MessageCircle size={20} /> Messages
          </NavLink>
          <NavLink to="/admin/dashboard/announcements" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <Megaphone size={20} /> Announcements
          </NavLink>
          <NavLink to="/admin/dashboard/reports" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <BarChart3 size={20} /> Reports
          </NavLink>
          <NavLink to="/admin/dashboard/enrolled-courses" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "") }>
            <ClipboardList size={20} /> Students Enrolled Course
          </NavLink>
        </nav>
        <div className="admin-sidebar-bottom" style={{ overflowX: "hidden" }}>
          <NavLink to="/admin/dashboard/settings" className={({ isActive }) => "admin-nav-item" + (isActive ? " active" : "")}>
            <Settings size={20} /> Settings
          </NavLink>
          <button type="button" className="admin-nav-item" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      {sidebarOpen && <button type="button" className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}
      <main className="admin-main">
        <div className="admin-mobile-topbar">
          <button
            type="button"
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle admin sidebar"
          >
            <Menu size={18} />
          </button>
          <span className="admin-mobile-title">Admin Panel</span>
        </div>
        <div key={location.pathname} className="route-transition route-transition-admin">
          <Outlet />
        </div>
      </main>

      {logoutModalOpen && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-logout-confirm-title"
          onClick={() => setLogoutModalOpen(false)}
        >
          <div className="admin-modal admin-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="admin-logout-confirm-title" className="admin-confirm-title">Log out from admin?</h2>

            <p className="admin-confirm-sub">
              You will be signed out of the admin dashboard.
            </p>

            <div className="admin-confirm-card">
              <strong>Admin session</strong>
              <span className="admin-confirm-meta">You can log back in anytime.</span>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-btn danger" onClick={confirmLogout}>
                Log out
              </button>
              <button type="button" className="admin-btn" onClick={() => setLogoutModalOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
