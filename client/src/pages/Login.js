import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: 3 + Math.random() * 6,
  delay: Math.random() * 5,
  duration: 6 + Math.random() * 8
}));

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1 = role select, 2 = credentials
  const [selectedRole, setSelectedRole] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      key: 'user',
      icon: '👤',
      label: 'New User',
      subtitle: 'Browse NGOs, donate & request events',
      color: 'var(--indigo)'
    },
    {
      key: 'ngo',
      icon: '🏢',
      label: 'NGO Founder / Member',
      subtitle: 'Manage your NGO, review applications',
      color: 'var(--violet)'
    }
  ];

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setAnimating(true);
    setTimeout(() => {
      setStep(2);
      setAnimating(false);
    }, 400);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated particles */}
      <div className="particles" aria-hidden="true">
        {PARTICLES.map((p) => (
          <span
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      <div className={`auth-card ${animating ? 'card-exit' : 'card-enter'}`}>
        {step === 1 ? (
          <>
            <div className="auth-header">
              <div className="auth-logo">🌿</div>
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Choose how you'd like to sign in</p>
            </div>

            <div className="role-cards-grid">
              {roles.map((role) => (
                <button
                  key={role.key}
                  className="role-card-btn"
                  onClick={() => handleRoleSelect(role.key)}
                  style={{ '--role-color': role.color }}
                >
                  <span className="role-card-icon">{role.icon}</span>
                  <span className="role-card-label">{role.label}</span>
                  <span className="role-card-sub">{role.subtitle}</span>
                  <span className="role-card-arrow">→</span>
                </button>
              ))}
            </div>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Register here</Link>
            </p>
          </>
        ) : (
          <>
            <div className="auth-header">
              <button className="back-btn" onClick={() => setStep(1)} aria-label="Go back">
                ← Back
              </button>
              <div className="auth-logo">
                {selectedRole === 'user' ? '👤' : '🏢'}
              </div>
              <h2>
                {selectedRole === 'user' ? 'User Login' : 'NGO Login'}
              </h2>
              <p className="auth-subtitle">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group floating">
                <input
                  type="email"
                  name="email"
                  id="login-email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  autoComplete="email"
                />
                <label htmlFor="login-email">Email Address</label>
              </div>

              <div className="input-group floating">
                <input
                  type="password"
                  name="password"
                  id="login-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  autoComplete="current-password"
                />
                <label htmlFor="login-password">Password</label>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn btn-primary full-width shimmer-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">Register here</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
