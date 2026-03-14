import React, { useState } from "react";
import api from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/change-password", {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirm,
      });
      setMessage(res?.data?.message || "Password changed successfully.");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response?.data?.errors?.current_password?.[0] ?? "Failed to change password.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      {message && <div className="pill success">{message}</div>}
      {error && <div className="pill warn">{error}</div>}

      <input
        type={showPasswords ? "text" : "password"}
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="educo-input"
        required
      />
      <input
        type={showPasswords ? "text" : "password"}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="educo-input"
        required
      />
      <input
        type={showPasswords ? "text" : "password"}
        placeholder="Confirm New Password"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        className="educo-input"
        required
      />

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={showPasswords}
          onChange={(e) => setShowPasswords(e.target.checked)}
        />
        <span>Show passwords</span>
      </label>

      <button type="submit" className="button primary">
        Change Password
      </button>
    </form>
  );
};

export default ChangePassword;

