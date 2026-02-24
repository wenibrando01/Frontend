import React from 'react';
import Card from '../ui/Card';

function listOrNone(list) {
  if (!list || list.length === 0) return 'None';
  return list.join(', ');
}

export default function SubjectDetails({ subject }) {
  if (!subject) {
    return (
      <Card title="Subject details">
        <p className="muted">Select a subject on the left to view details.</p>
      </Card>
    );
  }

  return (
    <Card title={`${subject.code} · ${subject.title}`} description={subject.description}>
      <div className="subject-details">
        <div className="subject-summary">
          <div>
            <div className="muted">Code</div>
            <div className="mono">{subject.code}</div>
          </div>
          <div>
            <div className="muted">Units</div>
            <div>{subject.units}</div>
          </div>
          <div>
            <div className="muted">Offered</div>
            <div>
              {subject.offering} · {subject.semester}
            </div>
          </div>
          <div>
            <div className="muted">Program</div>
            <div>{subject.programCode === 'All' ? 'All programs (GE)' : subject.programCode}</div>
          </div>
        </div>

        <div className="subject-meta-grid">
          <div>
            <div className="muted">Pre-requisites</div>
            <div className="mono">{listOrNone(subject.prerequisites)}</div>
          </div>
          <div>
            <div className="muted">Co-requisites</div>
            <div className="mono">{listOrNone(subject.corequisites)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

