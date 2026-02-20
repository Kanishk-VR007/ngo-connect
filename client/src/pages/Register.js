import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    bio: '',
    city: '',
    state: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
        location: {
          city: formData.city,
          state: formData.state,
          coordinates: [0, 0]
        }
      };

      await register(registrationData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      user: 'Browse NGOs, request events, make donations, and register for events',
      ngo_founder: 'Create and manage your own NGO with full control',
      ngo_member: 'Join an existing NGO and help manage activities',
      admin: 'Platform administration (restricted access)'
    };
    return descriptions[role] || '';
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Create Your Account</h2>
          <p className="auth-subtitle">Join NGO Connect and make a difference</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Role Selection */}
          <div className="form-section">
            <label className="form-label">I want to register as</label>
            <div className="role-selector">
              {[
                { value: 'user', label: 'User', icon: '👤' },
                { value: 'ngo_founder', label: 'NGO Founder', icon: '🏢' },
                { value: 'ngo_member', label: 'NGO Member', icon: '👥' },
              ].map((role) => (
                <div
                  key={role.value}
                  className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, role: role.value })}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                </div>
              ))}
            </div>
            <p className="role-description">{getRoleDescription(formData.role)}</p>
          </div>

          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>

            <div className="input-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>

              <div className="input-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="input-group">
              <label>Bio (Optional)</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us a bit about yourself..."
                rows="3"
                maxLength="500"
              />
              <span className="char-count">{formData.bio.length}/500</span>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <h3 className="section-title">Location</h3>

            <div className="input-row">
              <div className="input-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Your city"
                />
              </div>

              <div className="input-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Your state"
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
