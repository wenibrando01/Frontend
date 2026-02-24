import React from 'react';

export default function ProgramCard({ program, isActive, onClick }) {
  return (
    <button
      type="button"
      className={`program-card ${isActive ? 'is-active' : ''}`}
      onClick={onClick}
    >
      <div className="program-card-header">
        <span className="program-code mono">{program.code}</span>
        <span className={`pill ${program.status === 'Active' ? 'ok' : program.status === 'Phased out' ? 'warn' : 'info'}`}>
          {program.status}
        </span>
      </div>
      <div className="program-name">{program.name}</div>
      <div className="program-meta">
        <span>{program.type}</span>
        <span>·</span>
        <span>{program.durationYears} years</span>
        <span>·</span>
        <span>{program.totalUnits} units</span>
      </div>
    </button>
  );
}

