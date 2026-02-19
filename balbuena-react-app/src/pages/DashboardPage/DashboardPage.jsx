import React from 'react';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BookOpen, ClipboardCheck, GraduationCap, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import WeatherCard from '../../components/dashboard/WeatherCard';
import ChatbotCard from '../../components/chat/ChatbotCard';
import { enrollmentTrend, kpi, recentActivity, studentsByCollege } from '../../mock/dashboard';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="page-kicker">Enrollment System</div>
          <h2 className="page-title">Overview</h2>
          <div className="page-subtitle">Mock analytics and utilities, structured for future Laravel REST integration.</div>
        </div>
      </div>

      <div className="grid kpi-grid">
        <StatCard label="Total Students" value={kpi.totalStudents.toLocaleString()} hint="Active records" icon={Users} />
        <StatCard
          label="Active Enrollments"
          value={kpi.activeEnrollments.toLocaleString()}
          hint="Current term"
          icon={GraduationCap}
        />
        <StatCard label="Open Sections" value={kpi.openSections.toLocaleString()} hint="Available slots" icon={BookOpen} />
        <StatCard
          label="Pending Clearance"
          value={kpi.pendingClearance.toLocaleString()}
          hint="Needs action"
          icon={ClipboardCheck}
        />
      </div>

      <div className="grid dashboard-grid">
        <Card title="Enrollment Trend" description="New enrollments per month (mock)">
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={enrollmentTrend} margin={{ top: 12, right: 12, bottom: 8, left: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Line type="monotone" dataKey="enrollments" stroke="#6366f1" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Students by College" description="Distribution (mock)">
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    color: 'white',
                  }}
                />
                <Pie data={studentsByCollege} dataKey="value" nameKey="name" innerRadius={62} outerRadius={96} paddingAngle={3}>
                  {studentsByCollege.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {studentsByCollege.map((s, idx) => (
              <div key={s.name} className="legend-item">
                <span className="legend-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="legend-name">{s.name}</span>
                <span className="legend-value">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <WeatherCard />

        <Card title="Recent Activity" description="System events (mock)">
          <div className="activity">
            {recentActivity.map((a) => (
              <div key={a.id} className="activity-row">
                <div className="activity-ts">{a.ts}</div>
                <div className="activity-text">{a.text}</div>
              </div>
            ))}
          </div>
        </Card>

        <div className="span-2">
          <ChatbotCard />
        </div>
      </div>
    </div>
  );
}

