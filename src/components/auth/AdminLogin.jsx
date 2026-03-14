import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./AuthForm.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginAsAdmin({ email: email.trim(), password, remember });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message
        ?? (data?.errors && Object.values(data.errors).flat().length && Object.values(data.errors).flat()[0])
        ?? (err.response?.status === 401 && "Invalid credentials.")
        ?? (err.code === "ERR_NETWORK" && "Cannot reach server. Is the API running?")
        ?? "Invalid credentials.";
      setError(typeof msg === "string" ? msg : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <div className="auth-role-switch" role="tablist" aria-label="Login role switch">
          <a href="/student/login" className="auth-role-link" role="tab" aria-selected="false">Student</a>
          <span className="auth-role-link active" role="tab" aria-selected="true">Admin</span>
        </div>

        {error && (
          <div className="pill warn" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
          autoComplete="email"
        />
        <div className="password-row">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <label className="checkbox-row remember-row">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <span>Remember me</span>
        </label>
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
