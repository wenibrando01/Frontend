import React, { useEffect, useState } from "react";
import api from "../../services/api";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [studentInfo, setStudentInfo] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", username: "", email: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, profileRes] = await Promise.all([
          api.get("/user"),
          api.get("/student/profile"),
        ]);
        const user = userRes.data?.user ?? userRes.data ?? {};
        const profile = profileRes.data ?? null;
        setStudentInfo(profile);
        setForm({
          first_name: user.first_name ?? "",
          last_name: user.last_name ?? "",
          username: user.username ?? "",
          email: user.email ?? "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.patch("/user", form);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="educo-content"><div className="skeleton skeleton-block" /></div>;

  return (
    <div className="educo-content">
      <div className="cardx" style={{ marginBottom: 16 }}>
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Profile</div>
            <div className="cardx-description muted">View and edit personal information.</div>
          </div>
        </div>
        <div className="cardx-body">
          {message && <div className="pill success" style={{ marginBottom: 10 }}>{message}</div>}
          {error && <div className="pill warn" style={{ marginBottom: 10 }}>{error}</div>}
          <form onSubmit={onSubmit} className="educo-settings-form">
            <div className="educo-form-row">
              <label className="educo-form-label">First name</label>
              <input className="educo-input" name="first_name" value={form.first_name} onChange={onChange} />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Last name</label>
              <input className="educo-input" name="last_name" value={form.last_name} onChange={onChange} />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Username</label>
              <input className="educo-input" name="username" value={form.username} onChange={onChange} />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Email</label>
              <input className="educo-input" name="email" type="email" value={form.email} onChange={onChange} />
            </div>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
          </form>
        </div>
      </div>

      {studentInfo && (
        <div className="cardx">
          <div className="cardx-header">
            <div>
              <div className="cardx-title">Student Details</div>
              <div className="cardx-description muted">Enrollment status and academic details.</div>
            </div>
          </div>
          <div className="cardx-body">
            <p className="muted">Course: {studentInfo.course?.course_name || "-"}</p>
            <p className="muted">Year level: {studentInfo.year_level || "-"}</p>
            <p className="muted">Status: {studentInfo.status || "active"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
