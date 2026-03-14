// src/components/auth/AuthForm.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { endpoints } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import ConfirmDialog from "../common/ConfirmDialog";
import "./AuthForm.css";

const AuthForm = ({ loginFn, redirectTo = "/dashboard", title, registerRedirectTo, showAdminLink, registerOnly }) => {
  const navigate = useNavigate();
  const { loginAsStudent, register } = useAuth();
  const login = loginFn ?? loginAsStudent;
  const canRegister = Boolean(endpoints?.auth?.register) && !registerOnly;
  const [isRegister, setIsRegister] = useState(Boolean(registerOnly));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [wantsNews, setWantsNews] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const authPhase = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "morning";
    if (hour >= 11 && hour < 17) return "day";
    if (hour >= 17 && hour < 20) return "evening";
    return "night";
  }, []);

  const executeSubmit = async () => {
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          first_name: firstName,
          last_name: lastName,
          username,
          email: identifier,
          password,
          password_confirmation: passwordConfirm,
          wants_newsletter: wantsNews,
        });
      } else {
        await login({ email: identifier, password, remember: rememberMe });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (isRegister && err?.response?.status === 404) {
        setError(
          "Registration endpoint is not available on the backend. Ask your backend dev for the correct route, then set VITE_AUTH_REGISTER_PATH in your .env."
        );
        return;
      }
      const data = err.response?.data;
      const message = data?.message
        || (data?.errors && Object.values(data.errors).flat().length && Object.values(data.errors).flat()[0])
        || (err.response?.status === 422 && "Validation failed. Check your input.")
        || (err.response?.status === 401 && "Invalid credentials.")
        || (err.response?.status === 500 && "Server error. Try again later.")
        || (err.code === "ERR_NETWORK" && "Cannot reach server. Is the API running?")
        || "Operation failed";
      setError(typeof message === "string" ? message : "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (loading) return;

    if (isRegister && !acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setConfirmOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={`login-page auth-phase-${authPhase}`}>
      <form onSubmit={handleSubmit} className="login-card">
        {!isRegister && !registerOnly && (
          <>
            <div className="auth-role-switch" role="tablist" aria-label="Login role switch">
              <span className="auth-role-link active" role="tab" aria-selected="true">Student</span>
              <a href="/admin/login" className="auth-role-link" role="tab" aria-selected="false">Admin</a>
            </div>
          </>
        )}

        {isRegister && <h2 className="login-title">Student Registration</h2>}

        {error && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div className="pill warn">{error}</div>
          </div>
        )}

        {isRegister && (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="login-input"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="login-input"
              required
            />
            <input
              type="text"
              placeholder="Username (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </>
        )}

        <input
          type="text"
          placeholder="Username or Email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="login-input"
          required
        />

        <div className="password-row">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {isRegister && (
          <>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="login-input"
              required
            />
            <label className="checkbox-row remember-row">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>I accept the Terms and Conditions</span>
            </label>
            <label className="checkbox-row remember-row">
              <input
                type="checkbox"
                checked={wantsNews}
                onChange={(e) => setWantsNews(e.target.checked)}
              />
              <span>Send me occasional updates</span>
            </label>
          </>
        )}

        {!isRegister && (
          <label className="checkbox-row remember-row">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>
        )}

        <button type="submit" className="login-button">
          {isRegister ? "Register" : "Login"}
        </button>

        {canRegister && (
          <p
            className="toggle-link"
            onClick={() => setIsRegister(!isRegister)}
            style={{ cursor: "pointer" }}
          >
            {isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"}
          </p>
        )}
        {registerOnly && (
          <p className="toggle-link" style={{ marginTop: 8 }}>
            <a href="/student/login">Already have an account? Login</a>
          </p>
        )}
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title={isRegister ? "Confirm Registration" : "Confirm Login"}
        message={isRegister ? "Create this student account now?" : "Log in with these credentials now?"}
        meta={isRegister ? "Your account details will be submitted to the server." : "You will be redirected to your dashboard."}
        confirmText={isRegister ? "Register" : "Log in"}
        confirmClassName="admin-btn primary"
        onConfirm={async () => {
          setConfirmOpen(false);
          await executeSubmit();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default AuthForm;