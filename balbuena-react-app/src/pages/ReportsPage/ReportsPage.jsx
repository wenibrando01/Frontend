import React from 'react';
import Card from '../../components/ui/Card';

export default function ReportsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Analytics</div>
          <h2 className="page-title">Reports</h2>
          <div className="page-subtitle">Mock report tiles. Later: downloadable PDFs/CSVs from Laravel.</div>
        </div>
      </div>

      <div className="grid three-col">
        <Card title="Enrollment Summary" description="By term, program, year level">
          <div className="muted">Planned API: `GET /api/reports/enrollment-summary`</div>
          <button className="button primary" type="button">
            Open (mock)
          </button>
        </Card>

        <Card title="Section Utilization" description="Slots filled vs capacity">
          <div className="muted">Planned API: `GET /api/reports/section-utilization`</div>
          <button className="button primary" type="button">
            Open (mock)
          </button>
        </Card>

        <Card title="Clearance & Payments" description="Pending items & collections">
          <div className="muted">Planned API: `GET /api/reports/collections`</div>
          <button className="button primary" type="button">
            Open (mock)
          </button>
        </Card>
      </div>
    </div>
  );
}

