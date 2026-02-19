import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search } from 'lucide-react';

const titles = [
  { prefix: '/', title: 'Dashboard' },
  { prefix: '/students', title: 'Students' },
  { prefix: '/courses', title: 'Courses' },
  { prefix: '/enrollment', title: 'Enrollment' },
  { prefix: '/reports', title: 'Reports' },
  { prefix: '/settings', title: 'Settings' },
];

function getTitle(pathname) {
  return titles.find((t) => pathname === t.prefix || pathname.startsWith(`${t.prefix}/`))?.title ?? 'Enrollment System';
}

export default function Topbar({ user, onMenuClick, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = useMemo(() => getTitle(pathname), [pathname]);

  return (
    <header className="topbar">
      <button className="icon-button topbar-menu" type="button" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar-title">
        <div className="topbar-heading">{title}</div>
        <div className="topbar-breadcrumb">Academic Year 2025–2026</div>
      </div>

      <div className="topbar-spacer" />

      <button
        className="topbar-search"
        type="button"
        onClick={() => navigate('/students')}
        title="Search students (mock)"
      >
        <Search size={18} />
        <span className="topbar-search-text">Search students…</span>
      </button>

      <div className="topbar-user">
        <div className="topbar-user-meta">
          <div className="topbar-user-name">{user?.name ?? 'User'}</div>
          <div className="topbar-user-role">{user?.role ?? 'Staff'}</div>
        </div>

        <button className="icon-button" type="button" onClick={onLogout} aria-label="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

