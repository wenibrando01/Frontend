import React from "react";
import { useTheme } from "../../context/ThemeContext";

const AdminSettings = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="admin-content">
      <h1 className="admin-page-title">Settings</h1>
      <p className="admin-muted">Admin settings and preferences can be configured here.</p>

      <div className="admin-settings-card">
        <h2 className="admin-settings-title">Appearance</h2>
        <p className="admin-muted">Choose how the admin dashboard looks.</p>

        <div className="admin-settings-theme-row">
          <button
            type="button"
            className={`admin-btn ${theme === "light" ? "primary" : ""}`}
            onClick={() => setTheme("light")}
          >
            Light Mode
          </button>
          <button
            type="button"
            className={`admin-btn ${theme === "dark" ? "primary" : ""}`}
            onClick={() => setTheme("dark")}
          >
            Dark Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
