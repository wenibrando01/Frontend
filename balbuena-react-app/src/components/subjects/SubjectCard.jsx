import React from 'react';

export default function SubjectCard({ subject, isActive, onClick }) {
  const termLabel =
    subject.offering === 'Both' ? 'Semester & Term' : subject.offering === 'Term' ? 'Per term' : 'Per semester';

  return (
    <button type="button" className={`subject-card ${isActive ? 'is-active' : ''}`} onClick={onClick}>
      <div className="subject-card-header">
        <span className="mono">{subject.code}</span>
        <span className="pill info">{termLabel}</span>
      </div>
      <div className="subject-title">{subject.title}</div>
      <div className="subject-meta">
        <span>{subject.units} unit(s)</span>
        <span>·</span>
        <span>{subject.semester}</span>
        <span>·</span>
        <span>{subject.programCode === 'All' ? 'Shared / GE' : subject.programCode}</span>
      </div>
    </button>
  );
}

