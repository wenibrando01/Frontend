import React, { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from "recharts";
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
const RADIAN = Math.PI / 180;

const renderActiveSlice = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    midAngle,
    percent,
    startAngle,
    endAngle,
    fill,
  } = props;

  const labelRadius = innerRadius + (outerRadius - innerRadius) * 0.58;
  const lx = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const ly = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  const pct = `${((percent || 0) * 100).toFixed(0)}%`;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={outerRadius + 4}
        outerRadius={outerRadius + 11}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.2}
        className="course-dist-active-glow"
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#ffffff"
        strokeWidth={1.6}
        className="course-dist-active-slice"
      />
      <text
        x={lx}
        y={ly}
        textAnchor="middle"
        dominantBaseline="central"
        className="course-dist-active-percent"
      >
        {pct}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload, totalStudents, rankMap }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0];
  const name = point?.name || "Course";
  const value = Number(point?.value || 0);
  const percent = totalStudents > 0 ? (value / totalStudents) * 100 : 0;
  const rank = rankMap.get(name) || "-";

  return (
    <div className="course-dist-tooltip">
      <div className="course-dist-tooltip-title">{name}</div>
      <div className="course-dist-tooltip-line">Students: {value.toLocaleString()}</div>
      <div className="course-dist-tooltip-line">Share: {percent.toFixed(1)}%</div>
      <div className="course-dist-tooltip-line">Rank: #{rank} most enrolled</div>
      <div className="course-dist-tooltip-hint">Click to filter students</div>
    </div>
  );
};

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
  const [activeIndex, setActiveIndex] = useState(-1);
  const hoverIndexRef = useRef(-1);
  const leaveTimerRef = useRef(null);

  const handleSliceEnter = (_, index) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (hoverIndexRef.current === index) return;
    hoverIndexRef.current = index;
    setActiveIndex(index);
  };

  const handleSliceLeave = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    // Slight delay avoids flicker when cursor sits on the donut inner edge.
    leaveTimerRef.current = setTimeout(() => {
      hoverIndexRef.current = -1;
      setActiveIndex(-1);
      leaveTimerRef.current = null;
    }, 110);
  };

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

    return () => {
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
      }
    };
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
  const listData = data.map((item) => ({
    ...item,
    percent: totalStudents > 0 ? (item.value / totalStudents) * 100 : 0,
  }));
  const pieTop = data.slice(0, 10);
  const pieOthers = data.slice(10).reduce((sum, item) => sum + item.value, 0);
  const pieData = pieOthers > 0 ? [...pieTop, { name: "Others", value: pieOthers }] : pieTop;
  const sortedByValue = [...pieData].sort((a, b) => b.value - a.value);
  const rankMap = new Map(sortedByValue.map((item, index) => [item.name, index + 1]));
  const hoveredSlice = activeIndex >= 0 ? pieData[activeIndex] : null;
  const hoveredPercent = hoveredSlice && totalStudents > 0
    ? (hoveredSlice.value / totalStudents) * 100
    : 0;
  const centerLabel = hoveredSlice ? hoveredSlice.name : "Total";
  const centerValue = hoveredSlice ? hoveredSlice.value.toLocaleString() : totalStudents.toLocaleString();
  const centerSub = hoveredSlice
    ? `${hoveredPercent.toFixed(1)}% Share`
    : `${totalCourses} Courses`;
  const centerMeta = hoveredSlice
    ? `Rank #${rankMap.get(hoveredSlice.name) || "-"}`
    : `Top ${topShare.toFixed(1)}%`;
  const pieClassName = activeIndex >= 0 ? "course-dist-live-pie is-paused" : "course-dist-live-pie";

  return (
    <div className="course-dist-wrap">
      <div className="course-dist-donut-wrap">
        <ResponsiveContainer width="100%" height={308}>
          <PieChart>
            <Pie
              className={pieClassName}
              data={pieData}
              dataKey="value"
              nameKey="name"
              activeIndex={activeIndex}
              activeShape={renderActiveSlice}
              innerRadius={74}
              outerRadius={116}
              paddingAngle={1.5}
              stroke="#f8fafc"
              strokeWidth={1}
              labelLine={false}
              label={false}
              onMouseEnter={handleSliceEnter}
              onMouseLeave={handleSliceLeave}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? "#ffffff" : "transparent"}
                  strokeWidth={activeIndex === index ? 1.4 : 0}
                  style={{
                    cursor: "pointer",
                    opacity: activeIndex === -1 || activeIndex === index ? 1 : 0.48,
                    filter: activeIndex === index ? "saturate(1.12) brightness(1.06)" : "none",
                    transition: "opacity 240ms ease, filter 240ms ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ stroke: "rgba(59, 130, 246, 0.35)", strokeWidth: 1.2 }}
              content={<CustomTooltip totalStudents={totalStudents} rankMap={rankMap} />}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="course-dist-center-text">
          <div className="course-dist-center-core">
            <span className="course-dist-center-dot" aria-hidden="true" />
            <div className="course-dist-center-label">{centerLabel}</div>
            <div className="course-dist-center-value">{centerValue}</div>
            <div className="course-dist-center-sub">{centerSub}</div>
            <div className="course-dist-center-meta">{centerMeta}</div>
          </div>
        </div>
      </div>

      <div className="course-dist-grid">
        {listData.map((item, index) => {
          const color = COLORS[index % COLORS.length];
          const isActive = hoveredSlice?.name === item.name;
          const isDim = Boolean(hoveredSlice) && !isActive;
          return (
            <div
              key={`${item.name}-${index}`}
              className={`course-dist-row${isActive ? " is-active" : ""}${isDim ? " is-dim" : ""}`}
              title={item.name}
            >
              <div className="course-dist-left">
                <span className="course-dist-dot" style={{ background: color }} />
                <span className="course-dist-name">{item.name}</span>
              </div>
              <div className="course-dist-right">
                <span className="course-dist-mini" style={{ background: color }} />
                <span className="course-dist-count">{item.percent.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseDistributionChart;