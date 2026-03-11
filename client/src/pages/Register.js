import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const SERVICE_CATEGORIES = [
  'Education', 'Healthcare', 'Women Empowerment', 'Child Welfare',
  'Environment', 'Livelihood', 'Disability', 'Elder Care',
  'Animal Welfare', 'Disaster Relief', 'Rural Development', 'Other'
];

const NGO_TYPES = ['Charitable', 'Service', 'Participatory', 'Empowerment', 'Advocacy', 'Community-based', 'Faith-based', 'Other'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState('forward');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: '', bio: '', city: '', state: ''
  });

  const [ngoData, setNgoData] = useState({
    name: '', registrationNumber: '', ngoType: 'Service', description: '',
    email: '', phone: '', website: '', foundedYear: '', teamSize: '',
    serviceCategories: [],
    address: '', district: '', city: '', state: '', country: 'India', pincode: '',
    latitude: '', longitude: '',
    facebook: '', twitter: '', instagram: '', linkedin: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const goTo = (nextStep, dir = 'forward') => {
    setAnimDir(dir);
    setError('');
    setStep(nextStep);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNgoChange = (e) => {
    setNgoData({ ...ngoData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (cat) => {
    setNgoData(prev => ({
      ...prev,
      serviceCategories: prev.serviceCategories.includes(cat)
        ? prev.serviceCategories.filter(c => c !== cat)
        : [...prev.serviceCategories, cat]
    }));
  };

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNgoData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6)
        }));
      },
      () => setError('Unable to retrieve your location')
    );
  };

  const handleStep1Submit = () => {
    if (!formData.role) { setError('Please choose a role'); return; }
    goTo(2);
  };

  const handleStep2Submit = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.role === 'ngo_founder') {
      goTo(3);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
        location: {
          city: formData.city,
          state: formData.state,
          address: formData.city,
          coordinates: [0, 0]
        }
      };

      if (formData.role === 'ngo_founder') {
        const lat = parseFloat(ngoData.latitude) || 0;
        const lng = parseFloat(ngoData.longitude) || 0;
        payload.ngoDetails = {
          name: ngoData.name,
          registrationNumber: ngoData.registrationNumber,
          ngoType: ngoData.ngoType,
          description: ngoData.description,
          email: ngoData.email,
          phone: ngoData.phone,
          website: ngoData.website,
          foundedYear: parseInt(ngoData.foundedYear) || undefined,
          teamSize: parseInt(ngoData.teamSize) || 0,
          serviceCategories: ngoData.serviceCategories,
          location: {
            type: 'Point',
            coordinates: [lng, lat],
            address: ngoData.address,
            district: ngoData.district,
            city: ngoData.city,
            state: ngoData.state,
            country: ngoData.country || 'India',
            pincode: ngoData.pincode
          },
          socialMedia: {
            facebook: ngoData.facebook,
            twitter: ngoData.twitter,
            instagram: ngoData.instagram,
            linkedin: ngoData.linkedin
          }
        };
      }

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = formData.role === 'ngo_founder' ? 3 : 2;

  return (
    <div className="auth-container">
      <div className="particles" aria-hidden="true">
        {[...Array(14)].map((_, i) => (
          <span key={i} className="particle" style={{
            left: `${(i * 7.1) % 100}%`, top: `${(i * 13.7) % 100}%`,
            width: 4 + (i % 5), height: 4 + (i % 5),
            animationDelay: `${i * 0.4}s`, animationDuration: `${7 + (i % 5)}s`
          }} />
        ))}
      </div>

      <div className={`auth-card register-card step-${animDir}`}>
        {/* Progress bar */}
        {step > 1 && (
          <div className="progress-bar-wrap">
            <div
              className="progress-bar-fill"
              style={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            />
          </div>
        )}

        {step === 1 && (
          <>
            <div className="auth-header">
              <div className="auth-logo">🌿</div>
              <h2>Create Account</h2>
              <p className="auth-subtitle">How would you like to join?</p>
            </div>

            <div className="role-cards-grid">
              {[
                { value: 'user', icon: '👤', label: 'Community User', subtitle: 'Browse NGOs, donate & request events' },
                { value: 'ngo_founder', icon: '🏢', label: 'NGO Founder', subtitle: 'Create & manage your own NGO' }
              ].map((role) => (
                <button
                  key={role.value}
                  className={`role-card-btn ${formData.role === role.value ? 'selected' : ''}`}
                  onClick={() => { setFormData({ ...formData, role: role.value }); }}
                >
                  <span className="role-card-icon">{role.icon}</span>
                  <span className="role-card-label">{role.label}</span>
                  <span className="role-card-sub">{role.subtitle}</span>
                  {formData.role === role.value && <span className="role-check">✓</span>}
                </button>
              ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="btn btn-primary full-width shimmer-btn mt-1" onClick={handleStep1Submit}>
              Continue →
            </button>
            <p className="auth-footer">
              Already have an account? <Link to="/login" className="auth-link">Login here</Link>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-header">
              <button className="back-btn" onClick={() => goTo(1, 'back')}>← Back</button>
              <div className="auth-logo">👤</div>
              <h2>Personal Details</h2>
              <p className="auth-subtitle">Step 1 of {totalSteps}</p>
            </div>

            <div className="auth-form">
              <div className="input-row">
                <div className="input-group floating">
                  <input type="text" name="name" id="reg-name" value={formData.name}
                    onChange={handleChange} placeholder=" " required />
                  <label htmlFor="reg-name">Full Name *</label>
                </div>
                <div className="input-group floating">
                  <input type="tel" name="phone" id="reg-phone" value={formData.phone}
                    onChange={handleChange} placeholder=" " />
                  <label htmlFor="reg-phone">Phone Number</label>
                </div>
              </div>

              <div className="input-group floating">
                <input type="email" name="email" id="reg-email" value={formData.email}
                  onChange={handleChange} placeholder=" " required />
                <label htmlFor="reg-email">Email Address *</label>
              </div>

              <div className="input-row">
                <div className="input-group floating">
                  <input type="password" name="password" id="reg-pass" value={formData.password}
                    onChange={handleChange} placeholder=" " required minLength={6} />
                  <label htmlFor="reg-pass">Password *</label>
                </div>
                <div className="input-group floating">
                  <input type="password" name="confirmPassword" id="reg-cpass" value={formData.confirmPassword}
                    onChange={handleChange} placeholder=" " required />
                  <label htmlFor="reg-cpass">Confirm Password *</label>
                </div>
              </div>

              <div className="input-group floating">
                <textarea name="bio" id="reg-bio" value={formData.bio}
                  onChange={handleChange} placeholder=" " rows="2" maxLength="500" />
                <label htmlFor="reg-bio">Bio (optional)</label>
                <span className="char-count">{formData.bio.length}/500</span>
              </div>

              <div className="input-row">
                <div className="input-group floating">
                  <input type="text" name="city" id="reg-city" value={formData.city}
                    onChange={handleChange} placeholder=" " />
                  <label htmlFor="reg-city">City</label>
                </div>
                <div className="input-group floating">
                  <input type="text" name="state" id="reg-state" value={formData.state}
                    onChange={handleChange} placeholder=" " />
                  <label htmlFor="reg-state">State</label>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button className="btn btn-primary full-width shimmer-btn" onClick={handleStep2Submit} disabled={loading}>
                {loading ? <span className="btn-loading"><span className="spinner" />Creating...</span>
                  : (formData.role === 'ngo_founder' ? 'Next: NGO Details →' : 'Create Account')}
              </button>
            </div>
          </>
        )}

        {step === 3 && formData.role === 'ngo_founder' && (
          <>
            <div className="auth-header">
              <button className="back-btn" onClick={() => goTo(2, 'back')}>← Back</button>
              <div className="auth-logo">🏢</div>
              <h2>NGO Details</h2>
              <p className="auth-subtitle">Step 2 of {totalSteps}</p>
            </div>

            <div className="auth-form ngo-form">
              <h3 className="section-title">Basic Info</h3>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="text" name="name" id="ngo-name" value={ngoData.name}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-name">NGO Name *</label>
                </div>
                <div className="input-group floating">
                  <input type="text" name="registrationNumber" id="ngo-reg" value={ngoData.registrationNumber}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-reg">Reg. Number *</label>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group floating">
                  <select name="ngoType" id="ngo-type" value={ngoData.ngoType} onChange={handleNgoChange}>
                    {NGO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label htmlFor="ngo-type">NGO Type</label>
                </div>
                <div className="input-group floating">
                  <input type="number" name="foundedYear" id="ngo-year" value={ngoData.foundedYear}
                    onChange={handleNgoChange} placeholder=" " min="1900" max={new Date().getFullYear()} />
                  <label htmlFor="ngo-year">Founded Year</label>
                </div>
              </div>
              <div className="input-group floating">
                <textarea name="description" id="ngo-desc" value={ngoData.description}
                  onChange={handleNgoChange} placeholder=" " rows="3" required />
                <label htmlFor="ngo-desc">Description *</label>
              </div>

              <h3 className="section-title">Contact</h3>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="email" name="email" id="ngo-email" value={ngoData.email}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-email">NGO Email *</label>
                </div>
                <div className="input-group floating">
                  <input type="tel" name="phone" id="ngo-phone" value={ngoData.phone}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-phone">NGO Phone *</label>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="url" name="website" id="ngo-web" value={ngoData.website}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-web">Website</label>
                </div>
                <div className="input-group floating">
                  <input type="number" name="teamSize" id="ngo-team" value={ngoData.teamSize}
                    onChange={handleNgoChange} placeholder=" " min="1" />
                  <label htmlFor="ngo-team">Team Size</label>
                </div>
              </div>

              <h3 className="section-title">Service Categories</h3>
              <div className="category-grid">
                {SERVICE_CATEGORIES.map(cat => (
                  <button
                    key={cat} type="button"
                    className={`category-chip ${ngoData.serviceCategories.includes(cat) ? 'selected' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h3 className="section-title">Location</h3>
              <div className="input-group floating">
                <input type="text" name="address" id="ngo-addr" value={ngoData.address}
                  onChange={handleNgoChange} placeholder=" " required />
                <label htmlFor="ngo-addr">Street Address *</label>
              </div>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="text" name="district" id="ngo-dist" value={ngoData.district}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-dist">District</label>
                </div>
                <div className="input-group floating">
                  <input type="text" name="city" id="ngo-city" value={ngoData.city}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-city">City *</label>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="text" name="state" id="ngo-state" value={ngoData.state}
                    onChange={handleNgoChange} placeholder=" " required />
                  <label htmlFor="ngo-state">State *</label>
                </div>
                <div className="input-group floating">
                  <input type="text" name="pincode" id="ngo-pin" value={ngoData.pincode}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-pin">Pincode</label>
                </div>
              </div>

              <div className="geo-row">
                <div className="input-group floating">
                  <input type="number" step="any" name="latitude" id="ngo-lat" value={ngoData.latitude}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-lat">Latitude</label>
                </div>
                <div className="input-group floating">
                  <input type="number" step="any" name="longitude" id="ngo-lng" value={ngoData.longitude}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-lng">Longitude</label>
                </div>
                <button type="button" className="btn btn-geo" onClick={useGeolocation} title="Use my location">
                  📍 Locate Me
                </button>
              </div>

              <h3 className="section-title">Social Media (optional)</h3>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="url" name="facebook" id="ngo-fb" value={ngoData.facebook}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-fb">🌐 Facebook</label>
                </div>
                <div className="input-group floating">
                  <input type="url" name="instagram" id="ngo-ig" value={ngoData.instagram}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-ig">📸 Instagram</label>
                </div>
              </div>
              <div className="input-row">
                <div className="input-group floating">
                  <input type="url" name="twitter" id="ngo-tw" value={ngoData.twitter}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-tw">🐦 Twitter</label>
                </div>
                <div className="input-group floating">
                  <input type="url" name="linkedin" id="ngo-li" value={ngoData.linkedin}
                    onChange={handleNgoChange} placeholder=" " />
                  <label htmlFor="ngo-li">💼 LinkedIn</label>
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                className="btn btn-primary full-width shimmer-btn"
                onClick={handleFinalSubmit}
                disabled={loading}
              >
                {loading ? <span className="btn-loading"><span className="spinner" />Creating NGO...</span>
                  : '🚀 Create My NGO & Account'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
