import React, { useEffect, useState } from "react";
import { GraduationCap, BookOpen, CalendarCheck, CalendarOff } from "lucide-react";
import api from "../../services/api";

const cardConfig = [
  {
    key: "students",
    label: "Total Students",
    icon: GraduationCap,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
  },
  {
    key: "courses",
    label: "Total Courses",
    icon: BookOpen,
    color: "#0ea5e9",
    bg: "rgba(14, 165, 233, 0.12)",
  },
  {
    key: "avgAttendance",
    label: "Avg Attendance %",
    icon: CalendarCheck,
    color: "#1e40af",
    bg: "rgba(30, 64, 175, 0.12)",
  },
  {
    key: "holidays",
    label: "Holidays",
    icon: CalendarOff,
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.12)",
  },
];

const DashboardSummaryCards = () => {
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setError("");
        const res = await api.get("/dashboard/summary");
        const data = res.data?.cards ?? res.data;
        setCards(data || {});
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.message || "Failed to load summary.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="educo-summary-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="educo-summary-card">
            <div className="skeleton skeleton-line" style={{ width: "50%" }} />
            <div className="skeleton skeleton-line" style={{ width: "30%", marginTop: 8 }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="educo-summary-error">{error}</div>;
  }

  return (
    <div className="educo-summary-row">
      {cardConfig.map(({ key, label, icon: Icon, color, bg }) => (
        <div key={key} className="educo-summary-card">
          <div className="educo-summary-icon" style={{ backgroundColor: bg, color }}>
            <Icon size={24} />
          </div>
          <div className="educo-summary-content">
            <span className="educo-summary-label">{label}</span>
            <span className="educo-summary-value">
              {key === "avgAttendance" ? `${cards[key] ?? 0}%` : (cards[key] ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummaryCards;
