import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
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

const formatMonthLabel = (value) => {
  const raw = String(value || "");
  const asDate = new Date(raw.length === 7 ? `${raw}-01` : raw);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toLocaleDateString("en-US", { month: "short" });
  }
  return raw;
};

const formatTooltipLabel = (value) => {
  const raw = String(value || "");
  const asDate = new Date(raw.length === 7 ? `${raw}-01` : raw);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return raw;
};

const EnrollmentChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setError("");
        const res = await api.get("/students/enrollment-trends", {
          retry: { retries: 3 },
        });
        const rows = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setData(
          rows.map((item) => ({ month: item.month, total: item.total }))
        );
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again to see enrollment trends.");
        } else {
          setError(err.response?.data?.message || "Failed to load enrollment trends.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading)
    return (
      <div className="cardx-body">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" />
      </div>
    );
  if (error) return <div className="pill warn">{error}</div>;
  if (!data.length) return <p className="muted">No enrollment trend data.</p>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 10, left: -10, bottom: 10 }}>
        <defs>
          <linearGradient id="enrollmentBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke="#d7deea" vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(59, 130, 246, 0.08)" }}
          contentStyle={tooltipStyle}
          labelFormatter={formatTooltipLabel}
          formatter={(value) => [Number(value).toLocaleString(), "Students"]}
        />
        <Bar
          dataKey="total"
          fill="url(#enrollmentBarGradient)"
          radius={[10, 10, 0, 0]}
          barSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default EnrollmentChart;