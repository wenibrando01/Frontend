import React from "react";
import DashboardSummaryCards from "./DashboardSummaryCards";
import EnrollmentChart from "./EnrollmentChart";
import CourseDistributionChart from "./CourseDistributionChart";
import AttendanceChart from "./AttendanceChart";
import SchoolCalendarWidget from "./SchoolCalendarWidget";
import WeatherWidget from "../weather/WeatherWidget";
import StudentAnnouncements from "./StudentAnnouncements";

const Dashboard = () => {
  return (
    <div className="educo-content dashboard-reveal">
      <DashboardSummaryCards />

      <div className="grid dashboard-grid">
        <div className="cardx reveal-card">
          <div className="cardx-header">
            <div>
              <div className="cardx-title">Enrollment Trends</div>
              <div className="cardx-description muted">Monthly enrollment totals</div>
            </div>
          </div>
          <div className="cardx-body">
            <div className="chart">
              <EnrollmentChart />
            </div>
          </div>
        </div>

        <div className="cardx reveal-card">
          <div className="cardx-header">
            <div>
              <div className="cardx-title">Course Distribution</div>
              <div className="cardx-description muted">Students across courses</div>
            </div>
          </div>
          <div className="cardx-body">
            <div className="chart">
              <CourseDistributionChart />
            </div>
          </div>
        </div>

        <div className="cardx reveal-card">
          <div className="cardx-header">
            <div>
              <div className="cardx-title">Weather</div>
              <div className="cardx-description muted">Current conditions and 5‑day forecast</div>
            </div>
          </div>
          <div className="cardx-body">
            <WeatherWidget defaultCity="Manila" />
          </div>
        </div>

        <div className="cardx reveal-card">
          <div className="cardx-header">
            <div>
              <div className="cardx-title">Attendance Patterns</div>
              <div className="cardx-description muted">Attendance rate by school day</div>
            </div>
          </div>
          <div className="cardx-body attendance-stack">
            <div className="chart">
              <AttendanceChart />
            </div>
            <div className="attendance-bottom-row">
              <SchoolCalendarWidget />
              <div className="attendance-announcements">
                <div className="attendance-announcements-head">
                  <div className="cardx-title">Announcements</div>
                  <div className="cardx-description muted">Latest announcements from admin</div>
                </div>
                <StudentAnnouncements limit={0} itemClickMode="navigate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
