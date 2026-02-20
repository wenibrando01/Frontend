import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { auth } from '../../services/auth';
import './login.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = useMemo(() => location.state?.from || '/', [location.state]);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('admin'); // 'admin' | 'student'
  const [email, setEmail] = useState('admin@school.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        auth.registerStudent({ name: undefined, email, password });
      } else {
        auth.login({ email, password, role });
      }
      navigate(redirectTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg" aria-hidden="true" />
      <div className="login-shell">
        <header className="login-nav">
          <div className="login-nav-brand">
            <div className="login-nav-logo">ES</div>
            <div className="login-nav-text">
              <span className="login-nav-title">Enrollment System</span>
              <span className="login-nav-subtitle">Academic Portal</span>
            </div>
          </div>
          <div className="login-nav-links">
            <span>Students · Courses · Enrollment</span>
          </div>
        </header>

        <div className="login-card">
          <div className="login-illustration" aria-hidden="true">
            <div className="login-illustration-badge">Enrollment overview</div>
            <h2 className="login-illustration-title">Track student enrollment at a glance.</h2>
            <p className="login-illustration-text">
              Visualize term loads, program distribution, and section capacity before you approve each enrollment.
            </p>
            <ul className="login-illustration-list">
              <li>Monitor active enrollments per term.</li>
              <li>Validate prerequisites and clearances.</li>
              <li>Generate reports for registrar and deans.</li>
            </ul>
          </div>

          <form className="login-form login-form-pane" onSubmit={onSubmit}>
            <div className="login-header">
              <div className="login-badge">Sign in</div>
              <h1 className="login-title">
                {mode === 'register' ? 'Create student account' : role === 'admin' ? 'Admin sign in' : 'Student sign in'}
              </h1>
              <p className="login-subtitle">
                {mode === 'register'
                  ? 'Mock registration for students (no real backend yet).'
                  : role === 'admin'
                    ? 'Sign in as registrar / admin.'
                    : 'Sign in as a student to view the dashboard.'}
              </p>
            </div>

            <div className="login-tabs" aria-label="Login type">
              <button
                type="button"
                className={`login-tab ${role === 'admin' ? 'is-active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setRole('admin');
                  setEmail('admin@school.edu');
                }}
              >
                Admin login
              </button>
              <button
                type="button"
                className={`login-tab ${role === 'student' ? 'is-active' : ''}`}
                onClick={() => {
                  setMode('login');
                  setRole('student');
                  setEmail('student@school.edu');
                }}
              >
                Student login
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <Lock size={18} aria-hidden="true" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="icon-button icon-button-ghost"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="login-hint">
                {mode === 'register'
                  ? 'Prototype registration, password is not validated yet.'
                  : 'Prototype login accepts any credentials.'}
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading
                ? mode === 'register'
                  ? 'Creating account…'
                  : 'Signing in…'
                : mode === 'register'
                  ? 'Create student account'
                  : 'Sign in'}
            </button>

            {mode === 'login' ? (
              <div className="login-footer login-footer-inline">
                <span className="login-footer-text">No student account yet?</span>
                <button
                  type="button"
                  className="login-footer-link"
                  onClick={() => {
                    setMode('register');
                    setRole('student');
                    setEmail('');
                  }}
                >
                  Create student account
                </button>
              </div>
            ) : (
              <div className="login-footer login-footer-inline">
                <span className="login-footer-text">Already have an account?</span>
                <button
                  type="button"
                  className="login-footer-link"
                  onClick={() => {
                    setMode('login');
                    setRole('student');
                    setEmail('student@school.edu');
                  }}
                >
                  Back to sign in
                </button>
              </div>
            )}

            <div className="login-footer login-footer-muted">
              <span>
                This is a mock auth flow. In the final system, these actions will call Laravel auth & student endpoints.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

