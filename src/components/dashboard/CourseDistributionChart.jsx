import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const COLORS = ["#5f6ee8", "#3aa0c8", "#4cbfa6", "#7bbf6a", "#d5a24c", "#d97b6c", "#8c78c9", "#6f8aa0"];

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid #dbe5f0",
  background: "#ffffff",
  boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
};

const DISTRIBUTION_ENDPOINTS = ["/courses/distribution", "/admin/courses/distribution"];

function normalizeDistributionResponse(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || [];
  return rows
    .map((course) => ({
      name: String(course.course_name || "Unknown Course"),
      value: Number(course.students_count || course.students?.length || 0),
    }));
}

const CourseDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setError("");
        let lastError = null;

        for (const endpoint of DISTRIBUTION_ENDPOINTS) {
          try {
            const res = await api.get(endpoint, {
              retry: { retries: 3 },
            });
            const normalized = normalizeDistributionResponse(res.data);
            setData(normalized);
            return;
          } catch (endpointError) {
            const status = endpointError?.response?.status;
            if (status === 401) throw endpointError;
            if (status === 403 || status === 404) {
              lastError = endpointError;
              continue;
            }
            throw endpointError;
          }
        }

        throw lastError || new Error("No accessible course distribution endpoint found.");
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again to see course distribution.");
        } else {
          setError(err.response?.data?.message || "Failed to load course distribution.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDistribution();
  }, []);

  if (loading)
    return (
      <div className="cardx-body">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" />
      </div>
    );
  if (error) return <div className="pill warn">{error}</div>;
  if (!data.length) return <p className="muted">No course distribution data.</p>;

  const maxStudents = Math.max(...data.map((d) => d.value), 1);
  const totalStudents = data.reduce((sum, item) => sum + item.value, 0);
  const totalCourses = data.length;
  const topShare = totalStudents > 0 ? (maxStudents / totalStudents) * 100 : 0;
  const listData = data;
  const pieTop = data.slice(0, 10);
  const pieOthers = data.slice(10).reduce((sum, item) => sum + item.value, 0);
  const pieData = pieOthers > 0 ? [...pieTop, { name: "Others", value: pieOthers }] : pieTop;

  return (
    <div className="course-dist-wrap">
      <div className="course-dist-donut-wrap">
        <ResponsiveContainer width="100%" height={214}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={44}
              outerRadius={68}
              paddingAngle={1.5}
              stroke="#f8fafc"
              strokeWidth={1}
              labelLine={false}
              label={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => {
                const count = Number(value || 0);
                const pct = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                return [`${count.toLocaleString()} (${pct.toFixed(1)}%)`, "Students"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="course-dist-center-text">
          <div className="course-dist-center-core">
            <span className="course-dist-center-dot" aria-hidden="true" />
            <div className="course-dist-center-label">Total</div>
            <div className="course-dist-center-value">{totalStudents.toLocaleString()}</div>
            <div className="course-dist-center-sub">{totalCourses} Courses</div>
            <div className="course-dist-center-meta">Top {topShare.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div className="course-dist-grid">
        {listData.map((item, index) => {
          const percent = Math.max(8, Math.round((item.value / maxStudents) * 100));
          const color = COLORS[index % COLORS.length];
          return (
            <div key={`${item.name}-${index}`} className="course-dist-row">
              <div className="course-dist-left">
                <span className="course-dist-dot" style={{ backgroundColor: color }} />
                <span className="course-dist-name" title={item.name}>{item.name}</span>
              </div>
              <div className="course-dist-right">
                <span className="course-dist-count">{item.value.toLocaleString()}</span>
                <span className="course-dist-mini" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseDistributionChart;