import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginView() {
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState('platform-admin');
  const [password, setPassword] = useState('platform123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError(null);
    try {
      const res = await login(username.trim(), password);
      toast(
        'Welcome back!',
        `Signed in as ${res.username} (${res.role === 'PLATFORM_ADMIN' ? 'Platform Admin' : 'Tenant Admin'}).`
      );
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <main className="login-shell">
      <section className="login-story">
        <a className="brand brand-large" href="/">
          <span className="brand-mark" aria-hidden="true">GK</span>
          <span>GateKeeper</span>
        </a>

        <div className="story-copy">
          <p className="eyebrow">API MANAGEMENT SERVICE</p>
          <h1>
            One control plane.
            <br />
            Every tenant in its lane.
          </h1>
          <p className="story-lead">
            Provision organizations, configure smart gateway routes, enforce rate limits and idempotency,
            and keep every tenant boundary mathematically explicit.
          </p>

          <div className="architecture-strip" aria-label="GateKeeper architecture">
            <div>
              <span>01</span>
              <strong>Manage</strong>
              <small>Control plane (8081)</small>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>02</span>
              <strong>Route</strong>
              <small>Data plane (8080)</small>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>03</span>
              <strong>Observe</strong>
              <small>Analytics (8082)</small>
            </div>
          </div>
        </div>

        <p className="story-footer">GateKeeper · Spring Boot & Reactive Gateway Control Plane</p>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <p className="eyebrow">CONTROL PLANE ACCESS</p>
            <h2>Welcome back</h2>
            <p>Sign in with a platform or tenant administrator account.</p>
          </div>

          {error && (
            <div className="form-error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              autoComplete="username"
              placeholder="platform-admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button
            type="submit"
            className="button button-primary button-wide"
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Sign in to control plane'}</span>
            <ArrowRight size={16} />
          </button>

          <div className="demo-shortcuts">
            <span>Demo credentials</span>
            <div className="demo-chips">
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleDemoFill('platform-admin', 'platform123')}
              >
                Platform Admin
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleDemoFill('foodfast-admin', 'foodfast123')}
              >
                FoodFast Admin
              </button>
              <button
                type="button"
                className="demo-chip"
                onClick={() => handleDemoFill('quickshop-admin', 'quickshop123')}
              >
                QuickShop Admin
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
