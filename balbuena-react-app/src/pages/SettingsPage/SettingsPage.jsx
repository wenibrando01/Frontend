import React, { useState } from 'react';
import Card from '../../components/ui/Card';

export default function SettingsPage() {
  const [theme, setTheme] = useState('System');
  const [compact, setCompact] = useState(false);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Preferences</div>
          <h2 className="page-title">Settings</h2>
          <div className="page-subtitle">Client-only settings placeholders for later persistence.</div>
        </div>
      </div>

      <div className="grid two-col">
        <Card title="Appearance" description="Prototype controls">
          <div className="stack">
            <label className="field">
              <span>Theme</span>
              <select className="input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </label>

            <label className="field row">
              <span>Compact tables</span>
              <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
            </label>

            <div className="muted">Theme/compact mode wiring can be finalized once the design system is locked.</div>
          </div>
        </Card>

        <Card title="API Integration" description="Future Laravel endpoints">
          <div className="stack">
            <div className="muted">
              Suggested setup:
              <ul>
                <li>`/api/auth/login` (Sanctum/JWT)</li>
                <li>`/api/students`, `/api/courses`, `/api/enrollments`</li>
                <li>`/api/reports/*`</li>
              </ul>
            </div>
            <button className="button" type="button">
              Test API connection (mock)
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

