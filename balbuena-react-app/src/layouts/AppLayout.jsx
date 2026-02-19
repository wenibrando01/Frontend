import React, { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import Topbar from '../components/navigation/Topbar';
import { auth } from '../services/auth';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useMemo(() => auth.getUser(), []);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        <Topbar
          user={user}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onLogout={() => {
            auth.logout();
            window.location.assign('/login');
          }}
        />

        <main className="app-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

