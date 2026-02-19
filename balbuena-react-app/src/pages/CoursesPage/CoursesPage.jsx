import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { courses } from '../../mock/courses';

export default function CoursesPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return courses;
    return courses.filter((x) => `${x.code} ${x.title} ${x.prereq}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Catalog</div>
          <h2 className="page-title">Courses</h2>
          <div className="page-subtitle">Mock course catalog. Replace with `GET /api/courses` later.</div>
        </div>
      </div>

      <Card
        title="Course Catalog"
        description={`${filtered.length} course(s)`}
        actions={
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search course code or title…"
            aria-label="Search courses"
          />
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Units</th>
                <th>Prerequisite</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.code}>
                  <td className="mono">{c.code}</td>
                  <td>{c.title}</td>
                  <td>{c.units}</td>
                  <td className="mono">{c.prereq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

