import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const DashboardLayout = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1200) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className={`educo-dashboard ${theme === "dark" ? "educo-dashboard-dark" : ""}`}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <button type="button" className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />}
      <div className="educo-main">
        <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <div key={location.pathname} className="route-transition route-transition-student">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
