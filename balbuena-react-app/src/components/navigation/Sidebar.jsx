import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { to: "/app", label: "Dashboard", icon: Home, end: true },
  { to: "/app/programs", label: "Programs", icon: Layers3 },
  { to: "/app/subjects", label: "Subjects", icon: BookOpen },
  { to: "/app/students", label: "Students", icon: Users },
  { to: "/app/courses", label: "Courses", icon: BookOpen },
  { to: "/app/enrollment", label: "Enrollment", icon: GraduationCap },
  { to: "/app/reports", label: "Reports", icon: FileText },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${open ? "is-open" : ""}`}
        aria-label="Primary navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo">ES</div>

          <div>
            <div className="sidebar-title">Enrollment System</div>
            <div className="sidebar-subtitle">Frontend Prototype</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "is-active" : ""}`
                }
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footnote">
            Connected to Laravel API
          </div>
        </div>
      </aside>
    </>
  );
}