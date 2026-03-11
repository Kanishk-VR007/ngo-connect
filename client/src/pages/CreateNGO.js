import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import './CreateNGO.css';

const PREDEFINED_CATEGORIES = [
    'Education', 'Healthcare', 'Food & Nutrition', 'Shelter',
    'Women Empowerment', 'Child Welfare', 'Environmental', 'Disaster Relief',
    'Elderly Care', 'Skill Development', 'Legal Aid', 'Animal Welfare',
    'Rural Development', 'Youth Development', 'Disability Support'
];

const NGO_TYPES = [
    'Charitable', 'Service', 'Participatory', 'Empowerment',
    'Advocacy', 'Community-based', 'Faith-based', 'Other'
];

const CreateNGO = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [locationTab, setLocationTab] = useState('address'); // 'address' or 'coordinates'
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [customCategory, setCustomCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [coordsFromMap, setCoordsFromMap] = useState({ lat: '', lng: '' });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        registrationNumber: '',
        ngoType: 'Service',
        email: '',
        phone: '',
        website: '',
        foundedYear: '',
        teamSize: '',
        // Location text
        address: '',
        landmark: '',
        district: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        // Location geographic
        latitude: '',
        longitude: '',
        // Social media
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
    });

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'ngo_founder') {
            navigate('/dashboard');
        }
        if (user.ngoId) {
            navigate('/dashboard'); // already has NGO
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleCategory = (cat) => {
        if (cat === 'Other (enter manually)') return;
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported in your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setFormData(f => ({ ...f, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) }));
                setCoordsFromMap({ lat: latitude.toFixed(6), lng: longitude.toFixed(6) });
                setError('');
            },
            () => setError('Could not get your location. Please enter coordinates manually.')
        );
    };

    const nextStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.name || !formData.description || !formData.registrationNumber || !formData.email || !formData.phone) {
                setError('Please fill all required fields in this step');
                return;
            }
        }
        if (step === 2) {
            if (!formData.address || !formData.city || !formData.state) {
                setError('Please fill Address, City and State');
                return;
            }
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);

        const allCategories = [...selectedCategories];
        if (customCategory.trim()) allCategories.push(customCategory.trim());

        let coords = [0, 0];
        if (formData.longitude && formData.latitude) {
            coords = [parseFloat(formData.longitude), parseFloat(formData.latitude)];
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            registrationNumber: formData.registrationNumber,
            ngoType: formData.ngoType,
            email: formData.email,
            phone: formData.phone,
            website: formData.website,
            foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
            teamSize: formData.teamSize ? parseInt(formData.teamSize) : 1,
            serviceCategories: allCategories,
            customServiceCategory: customCategory.trim(),
            location: {
                address: formData.address,
                landmark: formData.landmark,
                district: formData.district,
                city: formData.city,
                state: formData.state,
                country: formData.country || 'India',
                pincode: formData.pincode,
                coordinates: coords
            },
            socialMedia: {
                facebook: formData.facebook,
                twitter: formData.twitter,
                instagram: formData.instagram,
                linkedin: formData.linkedin
            }
        };

        try {
            const response = await axios.post('/api/ngos/founder/create', payload);
            setSuccess('🎉 NGO created successfully! You are now the founder.');
            // Update user context with new ngoId
            if (response.data.data) {
                updateUser({ ...user, ngoId: response.data.data._id, ngoRole: 'founder' });
            }
            setTimeout(() => navigate('/dashboard'), 2200);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create NGO. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const steps = ['Basic Info', 'Location', 'Services', 'Social & Submit'];
    const progress = (step / steps.length) * 100;

    return (
        <div className="create-ngo-page">
            <div className="create-ngo-card">
                <div className="create-ngo-header">
                    <div className="create-ngo-badge">🏛 NGO Founder Setup</div>
                    <h1 className="auth-title">Register Your NGO</h1>
                    <p className="auth-subtitle">Complete the details below to set up your NGO profile</p>
                </div>

                {/* Progress */}
                <div className="register-progress" style={{ marginBottom: 32 }}>
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="progress-steps">
                        {steps.map((label, idx) => (
                            <div key={idx} className={`progress-step ${step > idx + 1 ? 'completed' : ''} ${step === idx + 1 ? 'active' : ''}`}>
                                <div className="step-circle">{step > idx + 1 ? '✓' : idx + 1}</div>
                                <span className="step-label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------- STEP 1: Basic Info ---------- */}
                {step === 1 && (
                    <div className="auth-step auth-step-enter">
                        <div className="form-two-col">
                            <span className="form-section-title">🏢 NGO Details</span>

                            <div className="input-float-group full-width">
                                <span className="input-icon">🏛</span>
                                <input type="text" name="name" id="ngo-name" value={formData.name}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-name" className="float-label">NGO Name *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">📋</span>
                                <input type="text" name="registrationNumber" id="ngo-reg" value={formData.registrationNumber}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-reg" className="float-label">Registration Number *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🏷</span>
                                <select name="ngoType" value={formData.ngoType} onChange={handleChange}
                                    className="float-select" id="ngo-type">
                                    {NGO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <label htmlFor="ngo-type" className="float-label" style={{ top: 6, fontSize: 11, color: '#a5b4fc' }}>NGO Type *</label>
                                <span className="select-arrow">▼</span>
                            </div>

                            <div className="input-float-group full-width">
                                <span className="input-icon">✉</span>
                                <input type="email" name="email" id="ngo-email" value={formData.email}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-email" className="float-label">NGO Email *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">📱</span>
                                <input type="tel" name="phone" id="ngo-phone" value={formData.phone}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-phone" className="float-label">Phone Number *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🌐</span>
                                <input type="url" name="website" id="ngo-web" value={formData.website}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-web" className="float-label">Website (optional)</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">📅</span>
                                <input type="number" name="foundedYear" id="ngo-year" value={formData.foundedYear}
                                    onChange={handleChange} placeholder=" " className="float-input"
                                    min="1900" max={new Date().getFullYear()} />
                                <label htmlFor="ngo-year" className="float-label">Founded Year</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">👥</span>
                                <input type="number" name="teamSize" id="ngo-team" value={formData.teamSize}
                                    onChange={handleChange} placeholder=" " className="float-input" min="1" />
                                <label htmlFor="ngo-team" className="float-label">Team Size</label>
                            </div>

                            <div className="input-float-group full-width">
                                <span className="input-icon">📝</span>
                                <textarea name="description" id="ngo-desc" value={formData.description}
                                    onChange={handleChange} placeholder=" " rows="4" className="float-input float-textarea" required />
                                <label htmlFor="ngo-desc" className="float-label">NGO Description *</label>
                            </div>
                        </div>

                        {error && <div className="auth-error"><span>⚠</span> {error}</div>}

                        <button type="button" className="auth-submit-btn" onClick={nextStep}>
                            Next: Location Details →
                        </button>
                    </div>
                )}

                {/* ---------- STEP 2: Location ---------- */}
                {step === 2 && (
                    <div className="auth-step auth-step-enter">
                        <button className="back-btn" onClick={() => setStep(1)}>← Back</button>
                        <h3 style={{ color: '#f1f5f9', marginBottom: 20, fontWeight: 700 }}>📍 NGO Location</h3>

                        <div className="form-two-col">
                            {/* Location mode tabs */}
                            <div className="location-mode-tabs">
                                <button type="button"
                                    className={`location-tab ${locationTab === 'address' ? 'active' : ''}`}
                                    onClick={() => setLocationTab('address')}>
                                    🏠 Enter Address
                                </button>
                                <button type="button"
                                    className={`location-tab ${locationTab === 'map' ? 'active' : ''}`}
                                    onClick={() => setLocationTab('map')}>
                                    🌍 Use Coordinates / GPS
                                </button>
                            </div>

                            {/* Text Address Fields (always shown) */}
                            <div className="input-float-group full-width">
                                <span className="input-icon">🏠</span>
                                <input type="text" name="address" id="ngo-addr" value={formData.address}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-addr" className="float-label">Address Line *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">📍</span>
                                <input type="text" name="landmark" id="ngo-landmark" value={formData.landmark}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-landmark" className="float-label">Landmark / Near</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🏙</span>
                                <input type="text" name="district" id="ngo-dist" value={formData.district}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-dist" className="float-label">District</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🌆</span>
                                <input type="text" name="city" id="ngo-city" value={formData.city}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-city" className="float-label">City *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🗺</span>
                                <input type="text" name="state" id="ngo-state" value={formData.state}
                                    onChange={handleChange} placeholder=" " className="float-input" required />
                                <label htmlFor="ngo-state" className="float-label">State *</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">📮</span>
                                <input type="text" name="pincode" id="ngo-pin" value={formData.pincode}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-pin" className="float-label">Pincode</label>
                            </div>

                            <div className="input-float-group">
                                <span className="input-icon">🌍</span>
                                <input type="text" name="country" id="ngo-country" value={formData.country}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-country" className="float-label">Country</label>
                            </div>

                            {/* Geographic Coordinates (shown when map tab active) */}
                            {locationTab === 'map' && (
                                <>
                                    <span className="form-section-title">📡 Geographic Coordinates</span>
                                    <div className="input-float-group">
                                        <span className="input-icon">↕</span>
                                        <input type="number" name="latitude" id="ngo-lat" value={formData.latitude}
                                            onChange={handleChange} placeholder=" " className="float-input" step="0.000001" />
                                        <label htmlFor="ngo-lat" className="float-label">Latitude</label>
                                    </div>
                                    <div className="input-float-group">
                                        <span className="input-icon">↔</span>
                                        <input type="number" name="longitude" id="ngo-lng" value={formData.longitude}
                                            onChange={handleChange} placeholder=" " className="float-input" step="0.000001" />
                                        <label htmlFor="ngo-lng" className="float-label">Longitude</label>
                                    </div>
                                    <div style={{ gridColumn: '1/-1' }}>
                                        <button type="button" className="geo-btn" onClick={handleGeolocate}>
                                            📍 Use My Current Location (GPS)
                                        </button>
                                    </div>
                                    {(formData.latitude && formData.longitude) && (
                                        <div className="map-coord-display">
                                            ✅ Coordinates set: {formData.latitude}, {formData.longitude}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {error && <div className="auth-error"><span>⚠</span> {error}</div>}

                        <button type="button" className="auth-submit-btn" onClick={nextStep}>
                            Next: Service Categories →
                        </button>
                    </div>
                )}

                {/* ---------- STEP 3: Services ---------- */}
                {step === 3 && (
                    <div className="auth-step auth-step-enter">
                        <button className="back-btn" onClick={() => setStep(2)}>← Back</button>
                        <h3 style={{ color: '#f1f5f9', marginBottom: 8, fontWeight: 700 }}>🎯 Service Categories</h3>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
                            Select all categories that apply to your NGO. You can also enter a custom category below.
                        </p>

                        <div className="tag-grid">
                            {PREDEFINED_CATEGORIES.map(cat => (
                                <div key={cat}
                                    className={`tag-item ${selectedCategories.includes(cat) ? 'selected' : ''}`}
                                    onClick={() => toggleCategory(cat)}>
                                    {cat}
                                </div>
                            ))}
                        </div>

                        <div className="custom-category-row">
                            <div className="input-float-group" style={{ flex: 1 }}>
                                <span className="input-icon">✏</span>
                                <input type="text" id="custom-cat" value={customCategory}
                                    onChange={e => setCustomCategory(e.target.value)}
                                    placeholder=" " className="float-input" maxLength={60} />
                                <label htmlFor="custom-cat" className="float-label">Custom Category (if not listed above)</label>
                            </div>
                        </div>

                        {selectedCategories.length === 0 && !customCategory && (
                            <div className="auth-error" style={{ marginTop: 12 }}>
                                <span>⚠</span> Please select at least one service category or enter a custom one
                            </div>
                        )}

                        <button type="button" className="auth-submit-btn" onClick={() => {
                            if (selectedCategories.length === 0 && !customCategory.trim()) {
                                setError('Please select or enter at least one service category');
                                return;
                            }
                            setError('');
                            setStep(4);
                        }}>
                            Next: Social Media & Submit →
                        </button>
                    </div>
                )}

                {/* ---------- STEP 4: Social Media & Submit ---------- */}
                {step === 4 && (
                    <div className="auth-step auth-step-enter">
                        <button className="back-btn" onClick={() => setStep(3)}>← Back</button>
                        <h3 style={{ color: '#f1f5f9', marginBottom: 8, fontWeight: 700 }}>🔗 Social Media (Optional)</h3>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
                            Add your NGO's social media pages to help people find and follow you.
                        </p>

                        <div className="form-two-col">
                            <div className="input-float-group">
                                <span className="input-icon">📘</span>
                                <input type="url" name="facebook" id="ngo-fb" value={formData.facebook}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-fb" className="float-label">Facebook URL</label>
                            </div>
                            <div className="input-float-group">
                                <span className="input-icon">🐦</span>
                                <input type="url" name="twitter" id="ngo-tw" value={formData.twitter}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-tw" className="float-label">Twitter / X URL</label>
                            </div>
                            <div className="input-float-group">
                                <span className="input-icon">📸</span>
                                <input type="url" name="instagram" id="ngo-ig" value={formData.instagram}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-ig" className="float-label">Instagram URL</label>
                            </div>
                            <div className="input-float-group">
                                <span className="input-icon">💼</span>
                                <input type="url" name="linkedin" id="ngo-li" value={formData.linkedin}
                                    onChange={handleChange} placeholder=" " className="float-input" />
                                <label htmlFor="ngo-li" className="float-label">LinkedIn URL</label>
                            </div>
                        </div>

                        {/* Summary Preview */}
                        <div className="ngo-summary-preview">
                            <h4>📋 Summary</h4>
                            <div className="summary-row"><span>NGO Name:</span> <strong>{formData.name}</strong></div>
                            <div className="summary-row"><span>Type:</span> <strong>{formData.ngoType}</strong></div>
                            <div className="summary-row"><span>Location:</span> <strong>{formData.city}, {formData.state}</strong></div>
                            <div className="summary-row"><span>Services:</span>
                                <strong>{[...selectedCategories, customCategory].filter(Boolean).join(', ') || '—'}</strong>
                            </div>
                        </div>

                        {error && <div className="auth-error"><span>⚠</span> {error}</div>}
                        {success && <div className="auth-success"><span>✅</span> {success}</div>}

                        <button type="button" className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <span className="btn-loading-inner"><span className="btn-spinner" /> Creating NGO...</span>
                            ) : (
                                <span>🚀 Create My NGO</span>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateNGO;
