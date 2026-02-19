import React from 'react';

export default function StatCard({ label, value, hint, icon }) {
  const Icon = icon;
  return (
    <div className="stat">
      <div className="stat-icon">{Icon ? <Icon size={18} /> : null}</div>
      <div className="stat-meta">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint ? <div className="stat-hint">{hint}</div> : null}
      </div>
    </div>
  );
}

