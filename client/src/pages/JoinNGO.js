import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './JoinNGO.css';

const JoinNGO = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [locationMode, setLocationMode] = useState('text'); // 'text' or 'map'
    const [applying, setApplying] = useState(null);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [selectedNGO, setSelectedNGO] = useState(null);

    useEffect(() => {
        fetchNGOs();
    }, []);

    const fetchNGOs = async (params = {}) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/ngos', {
                params: { limit: 50, ...params }
            });
            setNgos(response.data.data || []);
        } catch (err) {
            console.error('Fetch NGOs error:', err);
        } finally {
            setLoading(false);
        }
    };

    const searchByAddress = async () => {
        if (!locationSearch.trim()) return;
        setLoading(true);
        try {
            const response = await axios.get('/api/ngos/by-address', {
                params: { address: locationSearch, radius: 100 }
            });
            setNgos(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Location search failed. Try a different address.');
        } finally {
            setLoading(false);
        }
    };

    const searchByGPS = () => {
        if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            setLoading(true);
            try {
                const { latitude, longitude } = pos.coords;
                const response = await axios.get('/api/ngos/nearby', {
                    params: { lat: latitude, lng: longitude, distance: 100 }
                });
                setNgos(response.data.data || []);
                setError('');
            } catch (err) { setError('Could not fetch nearby NGOs'); }
            finally { setLoading(false); }
        });
    };

    const handleApply = async (ngoId, ngoName) => {
        setApplying(ngoId); setError(''); setSuccess('');
        try {
            await axios.post(`/api/ngos/${ngoId}/apply`, { message });
            setSuccess(`✅ Applied to ${ngoName}! Waiting for approval.`);
            setSelectedNGO(null); setMessage('');
        } catch (err) {
            setError(err.response?.data?.error || 'Application failed');
        } finally {
            setApplying(null);
        }
    };

    const filteredNGOs = ngos.filter(n =>
        n.name.toLowerCase().includes(search.toLowerCase()) ||
        (n.location?.city || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="join-ngo-page">
            <div className="join-ngo-container">
                {/* Header */}
                <div className="join-header">
                    <button className="back-nav-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                    <div>
                        <h1>Join an NGO</h1>
                        <p>Find an NGO that matches your passion and apply to become a member</p>
                    </div>
                </div>

                {/* Membership status notification */}
                {user?.membershipStatus === 'pending' && (
                    <div className="join-status-card pending">
                        <span>⏳</span>
                        <div>
                            <strong>Application Pending</strong>
                            <p>Your application is under review. You'll be notified once approved by the NGO founder.</p>
                        </div>
                    </div>
                )}
                {user?.role === 'ngo_member' && (
                    <div className="join-status-card active">
                        <span>✅</span>
                        <div>
                            <strong>You are already an NGO Member</strong>
                            <p>You can only be a member of one NGO at a time. Visit your dashboard to see your NGO.</p>
                        </div>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="join-search-card">
                    <div className="join-search-row">
                        <div className="join-search-input-wrap">
                            <span className="search-icon-inline">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by NGO name or city..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="join-search-input"
                            />
                        </div>
                        <button className="join-all-btn" onClick={() => { setSearch(''); setLocationSearch(''); fetchNGOs(); }}>
                            Show All
                        </button>
                    </div>

                    {/* Location Search */}
                    <div className="location-search-tabs">
                        <button
                            className={`loc-tab ${locationMode === 'text' ? 'active' : ''}`}
                            onClick={() => setLocationMode('text')}>
                            🏠 Search by Address
                        </button>
                        <button
                            className={`loc-tab ${locationMode === 'map' ? 'active' : ''}`}
                            onClick={() => setLocationMode('map')}>
                            📍 Use My GPS Location
                        </button>
                    </div>

                    {locationMode === 'text' && (
                        <div className="join-search-row">
                            <div className="join-search-input-wrap">
                                <span className="search-icon-inline">📍</span>
                                <input
                                    type="text"
                                    placeholder="Enter an address, city or area to find nearby NGOs..."
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    className="join-search-input"
                                    onKeyDown={e => e.key === 'Enter' && searchByAddress()}
                                />
                            </div>
                            <button className="join-search-btn" onClick={searchByAddress}>Search</button>
                        </div>
                    )}
                    {locationMode === 'map' && (
                        <div className="gps-search-row">
                            <button className="gps-search-btn" onClick={searchByGPS}>
                                📡 Find NGOs Near My Location
                            </button>
                            <span className="gps-note">Uses your device's GPS to find NGOs within 100km</span>
                        </div>
                    )}
                </div>

                {success && <div className="join-success"><span>✅</span> {success}</div>}
                {error && <div className="join-error"><span>⚠</span> {error}</div>}

                {/* Apply Message Modal Overlay */}
                {selectedNGO && (
                    <div className="apply-modal-overlay" onClick={() => setSelectedNGO(null)}>
                        <div className="apply-modal" onClick={e => e.stopPropagation()}>
                            <h3>Apply to {selectedNGO.name}</h3>
                            <p>Write a brief message about why you'd like to join (optional)</p>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Tell them about your skills, motivation, and how you want to contribute..."
                                rows="4"
                                className="apply-textarea"
                            />
                            <div className="apply-modal-actions">
                                <button className="apply-cancel-btn" onClick={() => setSelectedNGO(null)}>Cancel</button>
                                <button
                                    className="apply-confirm-btn"
                                    onClick={() => handleApply(selectedNGO._id, selectedNGO.name)}
                                    disabled={applying === selectedNGO._id}
                                >
                                    {applying === selectedNGO._id ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* NGO Grid */}
                {loading ? (
                    <div className="join-loading">
                        <div className="join-spinner" />
                        <p>Finding NGOs...</p>
                    </div>
                ) : (
                    <div className="ngo-join-grid">
                        {filteredNGOs.length === 0 ? (
                            <div className="join-empty">
                                <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                                <p>No NGOs found. Try a different search or location.</p>
                            </div>
                        ) : filteredNGOs.map(ngo => (
                            <div key={ngo._id} className="ngo-join-card">
                                <div className="njc-header">
                                    <div className="njc-logo">
                                        {ngo.logo
                                            ? <img src={ngo.logo} alt={ngo.name} />
                                            : <span>{ngo.name[0]}</span>
                                        }
                                    </div>
                                    <div>
                                        <h3>{ngo.name}</h3>
                                        <p className="njc-location">📍 {ngo.location?.city}, {ngo.location?.state}</p>
                                    </div>
                                    {ngo.isVerified && <span className="verified-badge">✓ Verified</span>}
                                </div>

                                <p className="njc-desc">{ngo.description?.slice(0, 140)}...</p>

                                <div className="njc-tags">
                                    {(ngo.serviceCategories || []).slice(0, 3).map(cat => (
                                        <span key={cat} className="njc-tag">{cat}</span>
                                    ))}
                                    {ngo.customServiceCategory && (
                                        <span className="njc-tag njc-custom-tag">{ngo.customServiceCategory}</span>
                                    )}
                                </div>

                                <div className="njc-footer">
                                    <div className="njc-stats">
                                        <span>👥 {ngo.teamSize || 0} members</span>
                                        <span>⭐ {ngo.rating?.average?.toFixed(1) || '—'}</span>
                                    </div>
                                    {user?.role === 'user' && user?.membershipStatus !== 'pending' && user?.membershipStatus !== 'active' ? (
                                        <button
                                            className="apply-btn"
                                            onClick={() => setSelectedNGO(ngo)}
                                        >
                                            Apply to Join →
                                        </button>
                                    ) : user?.role === 'ngo_member' ? (
                                        <span className="already-member">Already a Member</span>
                                    ) : user?.membershipStatus === 'pending' ? (
                                        <span className="pending-badge-njc">Application Pending</span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default JoinNGO;
