import React, { useMemo } from 'react';
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
import { BookOpen, ClipboardCheck, GraduationCap, LayoutList, Layers3 } from 'lucide-react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/dashboard/StatCard';
import WeatherCard from '../../components/dashboard/WeatherCard';
import ChatbotCard from '../../components/chat/ChatbotCard';
import { enrollmentTrend, kpi, recentActivity, studentsByCollege } from '../../mock/dashboard';
import { programs } from '../../mock/programs';
import { subjects } from '../../mock/subjects';

const PIE_COLORS = ['#6366f1', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const totalPrograms = programs.length;
  const totalSubjects = subjects.length;
  const activePrograms = programs.filter((p) => p.status === 'Active').length;
  const inactivePrograms = totalPrograms - activePrograms;
  const subjectsWithPrereq = subjects.filter((s) => s.prerequisites && s.prerequisites.length > 0).length;

  const subjectsByOffering = useMemo(
    () => [
      { label: 'Semester', value: subjects.filter((s) => s.offering === 'Semester').length },
      { label: 'Term', value: subjects.filter((s) => s.offering === 'Term').length },
      { label: 'Both', value: subjects.filter((s) => s.offering === 'Both').length },
    ],
    []
  );

  const recentItems = useMemo(
    () =>
      [...programs, ...subjects]
        .map((item) => ({
          type: 'durationYears' in item ? 'Program' : 'Subject',
          code: item.code,
          name: 'name' in item ? item.name : item.title,
          addedAt: item.addedAt,
        }))
        .sort((a, b) => (a.addedAt > b.addedAt ? -1 : 1))
        .slice(0, 4),
    []
  );

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
        <StatCard
          label="Total programs"
          value={totalPrograms.toString()}
          hint="Across all types"
          icon={Layers3}
        />
        <StatCard
          label="Total subjects"
          value={totalSubjects.toString()}
          hint="All programs"
          icon={LayoutList}
        />
        <StatCard
          label="Active programs"
          value={activePrograms.toString()}
          hint={`${inactivePrograms} inactive / under review`}
          icon={GraduationCap}
        />
        <StatCard
          label="Subjects with pre-reqs"
          value={subjectsWithPrereq.toString()}
          hint="Curriculum dependencies"
          icon={BookOpen}
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

        <Card title="Subjects by delivery" description="Offered per semester/term (mock)">
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
                <Pie
                  data={subjectsByOffering}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {subjectsByOffering.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            {subjectsByOffering.map((item, idx) => (
              <div key={item.label} className="legend-item">
                <span className="legend-dot" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                <span className="legend-name">{item.label}</span>
                <span className="legend-value">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <WeatherCard />

        <Card title="Recent changes" description="Recently added programs and subjects (mock)">
          <div className="activity">
            {recentItems.map((item) => (
              <div key={`${item.type}-${item.code}`} className="activity-row">
                <div className="activity-ts">{item.type}</div>
                <div className="activity-text">
                  <span className="mono">{item.code}</span> · {item.name}
                </div>
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

