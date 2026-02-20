import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './RequestEvent.css';

const RequestEvent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        eventType: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        preferredDate: '',
        targetNGO: '',
        expectedAttendees: '',
        urgency: 'medium'
    });

    useEffect(() => {
        fetchNGOs();
    }, []);

    const fetchNGOs = async () => {
        try {
            const response = await axios.get('/api/ngos');
            setNgos(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch NGOs:', err);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const requestData = {
                eventType: formData.eventType,
                description: formData.description,
                location: {
                    type: 'Point',
                    coordinates: [0, 0], // TODO: Get actual coordinates
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country
                },
                preferredDate: formData.preferredDate,
                targetNGO: formData.targetNGO || null,
                expectedAttendees: formData.expectedAttendees ? parseInt(formData.expectedAttendees) : null,
                urgency: formData.urgency
            };

            await axios.post('/api/event-requests', requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/my-event-requests');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="request-event-page">
                <div className="auth-required">
                    <h2>Authentication Required</h2>
                    <p>Please login to request events</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="request-event-page">
            <div className="request-event-container">
                <div className="request-event-header">
                    <h1>Request an Event</h1>
                    <p>Tell NGOs what kind of event you need in your community</p>
                </div>

                {success ? (
                    <div className="success-card">
                        <div className="success-icon">✅</div>
                        <h2>Request Submitted!</h2>
                        <p>NGOs in your area will review your request and respond soon.</p>
                        <button onClick={() => navigate('/my-event-requests')} className="btn btn-primary">
                            View My Requests
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="request-event-form">
                        {/* Event Type */}
                        <div className="form-section">
                            <h3 className="section-title">Event Details</h3>

                            <div className="input-group">
                                <label>Event Type *</label>
                                <select
                                    name="eventType"
                                    value={formData.eventType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select event type</option>
                                    <option value="Health Camp">🏥 Health Camp</option>
                                    <option value="Education Workshop">📚 Education Workshop</option>
                                    <option value="Food Distribution">🍽️ Food Distribution</option>
                                    <option value="Blood Donation">🩸 Blood Donation</option>
                                    <option value="Skill Development">🛠️ Skill Development</option>
                                    <option value="Environmental Cleanup">🌱 Environmental Cleanup</option>
                                    <option value="Awareness Campaign">📢 Awareness Campaign</option>
                                    <option value="Fundraising">💰 Fundraising</option>
                                    <option value="Community Service">🤝 Community Service</option>
                                    <option value="Other">📌 Other</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe what you need and why it's important for your community..."
                                    rows="5"
                                    required
                                />
                                <span className="helper-text">
                                    Be specific about what you need and how it will help your community
                                </span>
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>Expected Attendees</label>
                                    <input
                                        type="number"
                                        name="expectedAttendees"
                                        value={formData.expectedAttendees}
                                        onChange={handleChange}
                                        placeholder="Approximate number"
                                        min="1"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Urgency</label>
                                    <select name="urgency" value={formData.urgency} onChange={handleChange}>
                                        <option value="low">Low - Flexible timing</option>
                                        <option value="medium">Medium - Within a month</option>
                                        <option value="high">High - As soon as possible</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="form-section">
                            <h3 className="section-title">Location</h3>

                            <div className="input-group">
                                <label>Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Street address or landmark"
                                    required
                                />
                            </div>

                            <div className="input-row">
                                <div className="input-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="City"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        placeholder="State"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Preferred Date *</label>
                                <input
                                    type="date"
                                    name="preferredDate"
                                    value={formData.preferredDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                <span className="helper-text">
                                    This is your preferred date - NGO may suggest alternative dates
                                </span>
                            </div>
                        </div>

                        {/* Target NGO */}
                        <div className="form-section">
                            <h3 className="section-title">Target NGO (Optional)</h3>

                            <div className="input-group">
                                <label>Specific NGO</label>
                                <select
                                    name="targetNGO"
                                    value={formData.targetNGO}
                                    onChange={handleChange}
                                >
                                    <option value="">Any NGO can respond</option>
                                    {ngos.map((ngo) => (
                                        <option key={ngo._id} value={ngo._id}>
                                            {ngo.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="helper-text">
                                    Leave blank to let any NGO respond, or select a specific NGO
                                </span>
                            </div>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/events')}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading">
                                        <span className="spinner"></span>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Request'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default RequestEvent;
