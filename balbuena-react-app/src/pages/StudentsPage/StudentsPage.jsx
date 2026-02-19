import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { students } from '../../mock/students';

export default function StudentsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter((x) => `${x.id} ${x.name} ${x.program}`.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Navigation</div>
          <h2 className="page-title">Students</h2>
          <div className="page-subtitle">Mock student directory. Replace with `GET /api/students` later.</div>
        </div>
      </div>

      <Card
        title="Student List"
        description={`${filtered.length} result(s)`}
        actions={
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, name, or program…"
            aria-label="Search students"
          />
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Program</th>
                <th>Year</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td>{s.name}</td>
                  <td>{s.program}</td>
                  <td>{s.yearLevel}</td>
                  <td>
                    <span className={`pill ${s.status === 'Active' ? 'ok' : 'warn'}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

