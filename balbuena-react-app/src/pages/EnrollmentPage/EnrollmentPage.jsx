import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { enrollments } from '../../mock/enrollments';

export default function EnrollmentPage() {
  const [status, setStatus] = useState('All');
  const filtered = useMemo(() => {
    if (status === 'All') return enrollments;
    return enrollments.filter((e) => e.status === status);
  }, [status]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Workflow</div>
          <h2 className="page-title">Enrollment</h2>
          <div className="page-subtitle">
            Mock enrollment records. Future endpoints: `GET /api/enrollments`, `POST /api/enrollments`.
          </div>
        </div>
      </div>

      <div className="grid two-col">
        <Card title="Quick Actions" description="Prototype controls">
          <div className="stack">
            <button className="button primary" type="button">
              Create Enrollment (mock)
            </button>
            <button className="button" type="button">
              Validate Prerequisites (mock)
            </button>
            <button className="button" type="button">
              Generate Assessment (mock)
            </button>
            <div className="muted">
              These will later call Laravel APIs and update dashboard metrics in real-time.
            </div>
          </div>
        </Card>

        <Card
          title="Enrollment Records"
          description={`${filtered.length} record(s)`}
          actions={
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter status">
              <option>All</option>
              <option>Approved</option>
              <option>Pending clearance</option>
              <option>For payment</option>
            </select>
          }
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student</th>
                  <th>Term</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td className="mono">{e.id}</td>
                    <td>
                      <div className="tight">
                        <div>{e.studentName}</div>
                        <div className="muted mono">{e.studentId}</div>
                      </div>
                    </td>
                    <td>{e.term}</td>
                    <td>{e.units}</td>
                    <td>
                      <span className={`pill ${e.status === 'Approved' ? 'ok' : e.status === 'For payment' ? 'info' : 'warn'}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

