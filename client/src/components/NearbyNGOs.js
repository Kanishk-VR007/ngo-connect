import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NearbyNGOs.css';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
    { key: 'Education', icon: '🎓', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { key: 'Healthcare', icon: '🏥', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    { key: 'Food & Nutrition', icon: '🍲', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    { key: 'Shelter', icon: '🏠', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
    { key: 'Women Empowerment', icon: '👩', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    { key: 'Child Welfare', icon: '👶', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
    { key: 'Environmental', icon: '🌱', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { key: 'Disaster Relief', icon: '🚨', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { key: 'Skill Development', icon: '🛠️', color: '#84cc16', bg: 'rgba(132,204,22,0.12)' },
    { key: 'Elderly Care', icon: '👴', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    { key: 'Legal Aid', icon: '⚖️', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
];

// Haversine distance in km
const calcDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Dummy fallback NGOs (Tamil Nadu) — used when backend is offline
const DUMMY_NGOS = [
    { _id: 'd1', name: 'Chennai Care Foundation', serviceCategories: ['Education', 'Healthcare'], location: { coordinates: [80.2707, 13.0827], city: 'Chennai' }, isVerified: true },
    { _id: 'd2', name: 'Coimbatore Green Earth NGO', serviceCategories: ['Environmental'], location: { coordinates: [76.9558, 11.0168], city: 'Coimbatore' }, isVerified: true },
    { _id: 'd3', name: 'Madurai Women Empowerment Trust', serviceCategories: ['Women Empowerment', 'Skill Development', 'Legal Aid'], location: { coordinates: [78.1198, 9.9252], city: 'Madurai' }, isVerified: true },
    { _id: 'd4', name: 'Trichy Child Welfare Society', serviceCategories: ['Child Welfare', 'Education'], location: { coordinates: [78.6869, 10.7905], city: 'Tiruchirappalli' }, isVerified: true },
    { _id: 'd5', name: 'Salem Hunger Free Mission', serviceCategories: ['Food & Nutrition'], location: { coordinates: [78.1460, 11.6643], city: 'Salem' }, isVerified: false },
    { _id: 'd6', name: 'Tirunelveli Elderly Care Centre', serviceCategories: ['Elderly Care', 'Healthcare'], location: { coordinates: [77.6965, 8.7139], city: 'Tirunelveli' }, isVerified: true },
    { _id: 'd7', name: 'Vellore Health & Sanitation Trust', serviceCategories: ['Healthcare', 'Environmental'], location: { coordinates: [79.1325, 12.9165], city: 'Vellore' }, isVerified: true },
    { _id: 'd8', name: 'Erode Skill India Foundation', serviceCategories: ['Skill Development', 'Education'], location: { coordinates: [77.7172, 11.3410], city: 'Erode' }, isVerified: false },
    { _id: 'd9', name: 'Tiruppur Garment Workers Welfare', serviceCategories: ['Skill Development', 'Child Welfare'], location: { coordinates: [77.3411, 11.1085], city: 'Tiruppur' }, isVerified: true },
    { _id: 'd10', name: 'Thanjavur Heritage & Community', serviceCategories: ['Education', 'Food & Nutrition', 'Shelter'], location: { coordinates: [79.1378, 10.7870], city: 'Thanjavur' }, isVerified: true },
    { _id: 'd11', name: 'Cuddalore Disaster Relief Network', serviceCategories: ['Disaster Relief', 'Shelter'], location: { coordinates: [79.7681, 11.7480], city: 'Cuddalore' }, isVerified: true },
    { _id: 'd12', name: 'Nilgiris Tribal Welfare Org', serviceCategories: ['Education', 'Healthcare', 'Legal Aid'], location: { coordinates: [76.7337, 11.4102], city: 'Ooty' }, isVerified: true },
    { _id: 'd13', name: 'Tiruvannamalai Spiritual Service', serviceCategories: ['Food & Nutrition', 'Shelter', 'Healthcare'], location: { coordinates: [79.0747, 12.2253], city: 'Tiruvannamalai' }, isVerified: true },
    { _id: 'd14', name: 'Kanyakumari Coastal Welfare Trust', serviceCategories: ['Environmental', 'Child Welfare'], location: { coordinates: [77.5385, 8.0883], city: 'Kanyakumari' }, isVerified: true },
    { _id: 'd15', name: 'Nagapattinam Tsunami Survivors', serviceCategories: ['Disaster Relief', 'Child Welfare'], location: { coordinates: [79.8449, 10.7672], city: 'Nagapattinam' }, isVerified: true },
    { _id: 'd16', name: 'Ranipet Industrial Workers Welfare', serviceCategories: ['Legal Aid', 'Healthcare'], location: { coordinates: [79.3328, 12.9224], city: 'Ranipet' }, isVerified: false },
    { _id: 'd17', name: 'Dharmapuri Drought Relief Mission', serviceCategories: ['Disaster Relief', 'Environmental'], location: { coordinates: [78.1582, 12.1277], city: 'Dharmapuri' }, isVerified: true },
    { _id: 'd18', name: 'Chengalpattu Urban Slum Dev', serviceCategories: ['Shelter', 'Education', 'Healthcare'], location: { coordinates: [79.9864, 12.6919], city: 'Chengalpattu' }, isVerified: true },
    { _id: 'd19', name: 'Ramanathapuram Fishermen Welfare', serviceCategories: ['Disaster Relief', 'Healthcare', 'Child Welfare'], location: { coordinates: [78.8305, 9.3639], city: 'Ramanathapuram' }, isVerified: true },
    { _id: 'd20', name: 'Thoothukudi Port Community Fdn', serviceCategories: ['Skill Development', 'Environmental'], location: { coordinates: [78.1348, 8.7642], city: 'Thoothukudi' }, isVerified: true },
];

// ─── Main Component ───────────────────────────────────────────────────────────
const NearbyNGOs = ({ radiusKm = 200 }) => {
    const navigate = useNavigate();
    const [ngos, setNgos] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);
    const [usingDummy, setUsingDummy] = useState(false);

    // Reverse geocode to get city name
    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
            const state = data.address?.state || '';
            setLocationName(city ? `${city}, ${state}` : state);
        } catch {
            setLocationName('Your Location');
        }
    };

    // Fetch nearby NGOs from backend, fallback to dummy
    const fetchNearby = useCallback(async (lat, lng) => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/ngos', {
                params: { limit: 100 }
            });
            const data = res.data;
            let allNgos = [];
            if (data && data.success && Array.isArray(data.data)) {
                allNgos = data.data;
            } else if (Array.isArray(data)) {
                allNgos = data;
            }

            if (allNgos.length === 0) throw new Error('No NGOs in DB');

            // Sort by distance from user
            const withDist = allNgos
                .filter(n => n.location?.coordinates?.length === 2)
                .map(n => ({
                    ...n,
                    _distance: calcDistance(lat, lng, n.location.coordinates[1], n.location.coordinates[0])
                }))
                .filter(n => n._distance <= radiusKm)
                .sort((a, b) => a._distance - b._distance);

            setNgos(withDist.length > 0 ? withDist : allNgos.slice(0, 20).map(n => ({ ...n, _distance: null })));
            setUsingDummy(false);
        } catch {
            // Fallback: use dummy data sorted by distance
            const withDist = DUMMY_NGOS.map(n => ({
                ...n,
                _distance: calcDistance(lat, lng, n.location.coordinates[1], n.location.coordinates[0])
            })).sort((a, b) => a._distance - b._distance);
            setNgos(withDist);
            setUsingDummy(true);
        } finally {
            setLoading(false);
        }
    }, [radiusKm]);

    // Get user location on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation not supported. Showing Tamil Nadu NGOs.');
            // Use Tamil Nadu center as fallback
            const fallbackLat = 11.1271, fallbackLng = 78.6569;
            setUserLocation({ lat: fallbackLat, lng: fallbackLng });
            fetchNearby(fallbackLat, fallbackLng);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserLocation({ lat, lng });
                reverseGeocode(lat, lng);
                fetchNearby(lat, lng);
            },
            () => {
                setLocationError('Location access denied. Showing Tamil Nadu NGOs.');
                const fallbackLat = 11.1271, fallbackLng = 78.6569;
                setUserLocation({ lat: fallbackLat, lng: fallbackLng });
                setLocationName('Tamil Nadu');
                fetchNearby(fallbackLat, fallbackLng);
            },
            { timeout: 8000, maximumAge: 300000 }
        );
    }, [fetchNearby]);

    // Group NGOs by category
    const grouped = CATEGORIES.reduce((acc, cat) => {
        const matches = ngos.filter(n =>
            (n.serviceCategories || []).includes(cat.key)
        );
        if (matches.length > 0) acc[cat.key] = matches;
        return acc;
    }, {});

    const categoriesWithNGOs = CATEGORIES.filter(c => grouped[c.key]);
    const displayCategories = activeCategory
        ? categoriesWithNGOs.filter(c => c.key === activeCategory)
        : categoriesWithNGOs;

    const totalNGOs = ngos.length;

    return (
        <section className="nearby-ngos-section">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="nearby-header">
                <div className="nearby-header-left">
                    <div className="nearby-title-row">
                        <span className="nearby-pin-icon">📍</span>
                        <h2 className="nearby-title">NGOs Near You</h2>
                        {usingDummy && (
                            <span className="nearby-demo-badge">Demo Data</span>
                        )}
                    </div>
                    <p className="nearby-subtitle">
                        {loading
                            ? 'Detecting your location…'
                            : locationError
                                ? locationError
                                : `Showing ${totalNGOs} NGO${totalNGOs !== 1 ? 's' : ''} within ${radiusKm} km of ${locationName || 'your location'}`
                        }
                    </p>
                </div>

                <div className="nearby-header-right">
                    <button
                        className="nearby-map-btn"
                        onClick={() => navigate('/ngo-map')}
                    >
                        🗺️ Open Map View
                    </button>
                </div>
            </div>

            {/* ── Category Filter Pills ───────────────────────────────────────────── */}
            {!loading && categoriesWithNGOs.length > 0 && (
                <div className="nearby-filter-pills">
                    <button
                        className={`pill ${!activeCategory ? 'pill-active' : ''}`}
                        onClick={() => setActiveCategory(null)}
                    >
                        All ({totalNGOs})
                    </button>
                    {categoriesWithNGOs.map(cat => (
                        <button
                            key={cat.key}
                            className={`pill ${activeCategory === cat.key ? 'pill-active' : ''}`}
                            style={activeCategory === cat.key ? { background: cat.color, borderColor: cat.color } : {}}
                            onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                        >
                            {cat.icon} {cat.key} ({grouped[cat.key].length})
                        </button>
                    ))}
                </div>
            )}

            {/* ── Loading State ───────────────────────────────────────────────────── */}
            {loading && (
                <div className="nearby-loading">
                    <div className="nearby-loading-rings">
                        <div className="nlr nlr-1"></div>
                        <div className="nlr nlr-2"></div>
                        <div className="nlr-icon">📍</div>
                    </div>
                    <p>Finding NGOs near you…</p>
                </div>
            )}

            {/* ── Category Cards Grid ─────────────────────────────────────────────── */}
            {!loading && (
                <div className="nearby-categories-grid">
                    {displayCategories.length === 0 ? (
                        <div className="nearby-empty">
                            <div className="nearby-empty-icon">🔍</div>
                            <h3>No NGOs found nearby</h3>
                            <p>Try the <button className="link-btn" onClick={() => navigate('/ngo-map')}>Map Search</button> to explore a wider area.</p>
                        </div>
                    ) : (
                        displayCategories.map(cat => {
                            const catNgos = grouped[cat.key] || [];
                            return (
                                <div
                                    key={cat.key}
                                    className="nearby-cat-card"
                                    style={{ '--cat-color': cat.color, '--cat-bg': cat.bg }}
                                >
                                    {/* Card Header */}
                                    <div className="cat-card-header">
                                        <div className="cat-icon-wrap">
                                            <span className="cat-icon">{cat.icon}</span>
                                        </div>
                                        <div className="cat-header-text">
                                            <h3 className="cat-name">{cat.key}</h3>
                                            <span className="cat-count">{catNgos.length} NGO{catNgos.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* NGO Names List */}
                                    <ul className="cat-ngo-list">
                                        {catNgos.slice(0, 4).map(ngo => (
                                            <li
                                                key={ngo._id}
                                                className="cat-ngo-item"
                                                onClick={() => navigate(`/ngos/${ngo._id}`)}
                                                title={ngo.name}
                                            >
                                                <span className="ngo-item-dot"></span>
                                                <span className="ngo-item-name">{ngo.name}</span>
                                                <div className="ngo-item-meta">
                                                    {ngo.isVerified && <span className="ngo-item-verified">✓</span>}
                                                    {ngo._distance != null && (
                                                        <span className="ngo-item-dist">
                                                            {ngo._distance < 1
                                                                ? `${(ngo._distance * 1000).toFixed(0)}m`
                                                                : `${ngo._distance.toFixed(0)}km`}
                                                        </span>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                        {catNgos.length > 4 && (
                                            <li className="cat-ngo-more">
                                                +{catNgos.length - 4} more
                                            </li>
                                        )}
                                    </ul>

                                    {/* View All Button */}
                                    <button
                                        className="cat-view-all-btn"
                                        onClick={() => navigate(`/ngos?category=${encodeURIComponent(cat.key)}`)}
                                    >
                                        View All {cat.key} NGOs →
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </section>
    );
};

export default NearbyNGOs;
