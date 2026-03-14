import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "rgba(255, 255, 255, 0.96)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.16)",
};

const formatDateTick = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const HolidayAwareDot = (props) => {
  const { cx, cy, payload } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  const isHoliday = Boolean(payload?.isHoliday);
  const fill = isHoliday ? "#f59e0b" : "#22c55e";

  return <circle cx={cx} cy={cy} r={2.2} stroke="#ffffff" strokeWidth={1} fill={fill} />;
};

const HolidayAwareActiveDot = (props) => {
  const { cx, cy, payload } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  const isHoliday = Boolean(payload?.isHoliday);
  const fill = isHoliday ? "#f59e0b" : "#06b6d4";

  return <circle cx={cx} cy={cy} r={4.2} stroke="#ffffff" strokeWidth={1.8} fill={fill} />;
};

const AttendanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setError("");
        const res = await api.get("/attendance", { retry: { retries: 3 } });
        const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setData(
          rows.map((day) => ({
            date: day.date,
            attendance: day.attendance_rate,
            isHoliday: Boolean(day.is_holiday),
          }))
        );
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again to see attendance patterns.");
        } else {
          setError(err.response?.data?.message || "Failed to load attendance data.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading)
    return (
      <div className="cardx-body">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" />
      </div>
    );
  if (error) return <div className="pill warn">{error}</div>;
  if (!data.length) return <p className="muted">No attendance data.</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 6, left: -12, bottom: 2 }}>
        <defs>
          <linearGradient id="attendanceLineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="#d7deea" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          minTickGap={26}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
        />
        <Tooltip
          cursor={{ stroke: "#93c5fd", strokeDasharray: "4 4" }}
          contentStyle={tooltipStyle}
          labelFormatter={(value) => {
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
          }}
          formatter={(value, _name, ctx) => {
            const status = ctx?.payload?.isHoliday ? "Holiday" : "School Day";
            return [`${Number(value)}% (${status})`, "Attendance"];
          }}
        />
        <Line
          type="monotone"
          dataKey="attendance"
          stroke="url(#attendanceLineGradient)"
          strokeWidth={3.4}
          dot={<HolidayAwareDot />}
          activeDot={<HolidayAwareActiveDot />}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AttendanceChart;