import React, { useEffect, useState } from "react";
import api from "../../services/api";
import ChangePassword from "../auth/ChangePassword";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ first_name: "", last_name: "", username: "", email: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        const data = res.data?.user ?? res.data ?? {};
        setUser(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.patch("/user", form);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="educo-content">
        <div className="skeleton skeleton-line" style={{ width: "40%" }} />
        <div className="skeleton skeleton-block" style={{ marginTop: 16 }} />
      </div>
    );
  }

  return (
    <div className="educo-content">
      <h2 className="educo-settings-title">Settings</h2>

      <div className="cardx educo-settings-card">
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Personal account</div>
            <div className="cardx-description muted">Edit your name, username, and email.</div>
          </div>
        </div>
        <div className="cardx-body">
          {message && <div className="pill success educo-settings-msg">{message}</div>}
          {error && <div className="pill warn educo-settings-msg">{error}</div>}
          <form onSubmit={handleSubmit} className="educo-settings-form">
            <div className="educo-form-row">
              <label className="educo-form-label">First name</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="educo-input"
                placeholder="First name"
              />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Last name</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="educo-input"
                placeholder="Last name"
              />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="educo-input"
                placeholder="Username"
              />
            </div>
            <div className="educo-form-row">
              <label className="educo-form-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="educo-input"
                placeholder="Email"
              />
            </div>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>

      <div className="cardx educo-settings-card">
        <div className="cardx-header">
          <div>
            <div className="cardx-title">Account security</div>
            <div className="cardx-description muted">Change your password.</div>
          </div>
        </div>
        <div className="cardx-body">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
};

export default Settings;
