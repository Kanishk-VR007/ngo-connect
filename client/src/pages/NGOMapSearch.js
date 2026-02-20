import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeafletMap, { CATEGORY_COLORS } from '../components/LeafletMap';
import LoadingScreen from '../components/LoadingScreen';
import './NGOMapSearch.css';

// ─── Dummy Tamil Nadu NGO data (fallback when backend is unavailable) ─────────
const DUMMY_NGOS = [
    { _id: 'd1', name: 'Chennai Care Foundation', serviceCategories: ['Education', 'Healthcare'], location: { type: 'Point', coordinates: [80.2707, 13.0827], city: 'Chennai', state: 'Tamil Nadu', address: '45, Anna Salai, Chennai' }, phone: '044-23456789', rating: { average: 4.7, count: 210 }, isVerified: true, foundedYear: 2010, description: 'Providing quality education and healthcare to underprivileged children in Chennai.' },
    { _id: 'd2', name: 'Coimbatore Green Earth NGO', serviceCategories: ['Environmental'], location: { type: 'Point', coordinates: [76.9558, 11.0168], city: 'Coimbatore', state: 'Tamil Nadu', address: '12, Avinashi Road, Coimbatore' }, phone: '0422-3456789', rating: { average: 4.5, count: 95 }, isVerified: true, foundedYear: 2012, description: 'Dedicated to environmental conservation and tree plantation drives across Coimbatore.' },
    { _id: 'd3', name: 'Madurai Women Empowerment Trust', serviceCategories: ['Women Empowerment', 'Skill Development', 'Legal Aid'], location: { type: 'Point', coordinates: [78.1198, 9.9252], city: 'Madurai', state: 'Tamil Nadu', address: '78, Meenakshi Amman Kovil Street, Madurai' }, phone: '0452-2345678', rating: { average: 4.8, count: 175 }, isVerified: true, foundedYear: 2008, description: 'Empowering rural women through skill development and micro-finance support.' },
    { _id: 'd4', name: 'Trichy Child Welfare Society', serviceCategories: ['Child Welfare', 'Education'], location: { type: 'Point', coordinates: [78.6869, 10.7905], city: 'Tiruchirappalli', state: 'Tamil Nadu', address: '34, Rockfort Road, Tiruchirappalli' }, phone: '0431-2234567', rating: { average: 4.6, count: 88 }, isVerified: true, foundedYear: 2011, description: 'Protecting children from abuse and child labour in Tiruchirappalli.' },
    { _id: 'd5', name: 'Salem Hunger Free Mission', serviceCategories: ['Food & Nutrition'], location: { type: 'Point', coordinates: [78.1460, 11.6643], city: 'Salem', state: 'Tamil Nadu', address: '56, Omalur Main Road, Salem' }, phone: '0427-2345671', rating: { average: 4.4, count: 62 }, isVerified: false, foundedYear: 2015, description: 'Fighting hunger and malnutrition in Salem district by running community kitchens.' },
    { _id: 'd6', name: 'Tirunelveli Elderly Care Centre', serviceCategories: ['Elderly Care', 'Healthcare'], location: { type: 'Point', coordinates: [77.6965, 8.7139], city: 'Tirunelveli', state: 'Tamil Nadu', address: '23, Palayamkottai Road, Tirunelveli' }, phone: '0462-2234560', rating: { average: 4.9, count: 130 }, isVerified: true, foundedYear: 2009, description: 'Providing dignified care and medical support to abandoned elderly citizens.' },
    { _id: 'd7', name: 'Vellore Health & Sanitation Trust', serviceCategories: ['Healthcare', 'Environmental'], location: { type: 'Point', coordinates: [79.1325, 12.9165], city: 'Vellore', state: 'Tamil Nadu', address: '89, Katpadi Road, Vellore' }, phone: '0416-2234561', rating: { average: 4.5, count: 108 }, isVerified: true, foundedYear: 2013, description: 'Improving public health through sanitation drives and clean water projects.' },
    { _id: 'd8', name: 'Erode Skill India Foundation', serviceCategories: ['Skill Development', 'Education'], location: { type: 'Point', coordinates: [77.7172, 11.3410], city: 'Erode', state: 'Tamil Nadu', address: '12, Brough Road, Erode' }, phone: '0424-2234562', rating: { average: 4.3, count: 55 }, isVerified: false, foundedYear: 2016, description: 'Providing free vocational training to unemployed youth in Erode district.' },
    { _id: 'd9', name: 'Tiruppur Garment Workers Welfare', serviceCategories: ['Skill Development', 'Child Welfare', 'Healthcare'], location: { type: 'Point', coordinates: [77.3411, 11.1085], city: 'Tiruppur', state: 'Tamil Nadu', address: '45, Avinashi Road, Tiruppur' }, phone: '0421-2234563', rating: { average: 4.4, count: 72 }, isVerified: true, foundedYear: 2014, description: 'Supporting garment industry workers and their families in Tiruppur.' },
    { _id: 'd10', name: 'Thanjavur Heritage & Community Trust', serviceCategories: ['Education', 'Food & Nutrition', 'Shelter'], location: { type: 'Point', coordinates: [79.1378, 10.7870], city: 'Thanjavur', state: 'Tamil Nadu', address: '3, Gandhiji Road, Thanjavur' }, phone: '04362-234565', rating: { average: 4.7, count: 155 }, isVerified: true, foundedYear: 2007, description: 'Preserving cultural heritage while providing food and shelter support.' },
    { _id: 'd11', name: 'Cuddalore Disaster Relief Network', serviceCategories: ['Disaster Relief', 'Shelter', 'Food & Nutrition'], location: { type: 'Point', coordinates: [79.7681, 11.7480], city: 'Cuddalore', state: 'Tamil Nadu', address: '22, Beach Road, Cuddalore' }, phone: '04142-234567', rating: { average: 4.8, count: 195 }, isVerified: true, foundedYear: 2005, description: 'Providing rapid disaster relief to coastal communities in Cuddalore.' },
    { _id: 'd12', name: 'Nilgiris Tribal Welfare Organisation', serviceCategories: ['Education', 'Healthcare', 'Legal Aid'], location: { type: 'Point', coordinates: [76.7337, 11.4102], city: 'Ooty', state: 'Tamil Nadu', address: '5, Ooty Main Road, Udhagamandalam' }, phone: '0423-2234575', rating: { average: 4.9, count: 165 }, isVerified: true, foundedYear: 2004, description: 'Advocating for the rights and welfare of indigenous tribal communities in the Nilgiris.' },
    { _id: 'd13', name: 'Tiruvannamalai Spiritual & Social Service', serviceCategories: ['Food & Nutrition', 'Shelter', 'Healthcare'], location: { type: 'Point', coordinates: [79.0747, 12.2253], city: 'Tiruvannamalai', state: 'Tamil Nadu', address: '1, Arunachala Temple Road, Tiruvannamalai' }, phone: '04175-234579', rating: { average: 4.9, count: 230 }, isVerified: true, foundedYear: 2003, description: 'Providing free meals, medical care, and shelter to pilgrims and homeless individuals.' },
    { _id: 'd14', name: 'Kanyakumari Coastal Welfare Trust', serviceCategories: ['Environmental', 'Child Welfare', 'Education'], location: { type: 'Point', coordinates: [77.5385, 8.0883], city: 'Kanyakumari', state: 'Tamil Nadu', address: '2, Vivekananda Puram, Kanyakumari' }, phone: '04652-234574', rating: { average: 4.8, count: 118 }, isVerified: true, foundedYear: 2008, description: 'Protecting the environment and supporting fishing communities at the southernmost tip of India.' },
    { _id: 'd15', name: 'Nagapattinam Tsunami Survivors Trust', serviceCategories: ['Disaster Relief', 'Shelter', 'Child Welfare'], location: { type: 'Point', coordinates: [79.8449, 10.7672], city: 'Nagapattinam', state: 'Tamil Nadu', address: '3, Tsunami Memorial Road, Nagapattinam' }, phone: '04365-234586', rating: { average: 4.9, count: 200 }, isVerified: true, foundedYear: 2005, description: 'Supporting coastal communities in Nagapattinam with disaster preparedness and housing.' },
    { _id: 'd16', name: 'Karur Textile Artisans Welfare Society', serviceCategories: ['Skill Development', 'Women Empowerment'], location: { type: 'Point', coordinates: [78.0767, 10.9601], city: 'Karur', state: 'Tamil Nadu', address: '34, Textile Market Road, Karur' }, phone: '04324-234590', rating: { average: 4.5, count: 65 }, isVerified: true, foundedYear: 2011, description: 'Supporting handloom and textile artisans in Karur with fair trade access.' },
    { _id: 'd17', name: 'Theni Hill Tribes Education Foundation', serviceCategories: ['Education', 'Child Welfare'], location: { type: 'Point', coordinates: [77.4760, 10.0104], city: 'Theni', state: 'Tamil Nadu', address: '22, Periyakulam Road, Theni' }, phone: '04546-234591', rating: { average: 4.7, count: 88 }, isVerified: true, foundedYear: 2009, description: 'Providing quality education and scholarships to tribal children from the Anamalai hills.' },
    { _id: 'd18', name: 'Chengalpattu Urban Slum Development', serviceCategories: ['Shelter', 'Education', 'Healthcare'], location: { type: 'Point', coordinates: [79.9864, 12.6919], city: 'Chengalpattu', state: 'Tamil Nadu', address: '33, GST Road, Chengalpattu' }, phone: '044-27234583', rating: { average: 4.6, count: 95 }, isVerified: true, foundedYear: 2011, description: 'Transforming urban slums in Chengalpattu through housing improvement and sanitation.' },
    { _id: 'd19', name: 'Ramanathapuram Fishermen Welfare Trust', serviceCategories: ['Disaster Relief', 'Healthcare', 'Child Welfare'], location: { type: 'Point', coordinates: [78.8305, 9.3639], city: 'Ramanathapuram', state: 'Tamil Nadu', address: '5, Harbour Road, Ramanathapuram' }, phone: '04567-234570', rating: { average: 4.6, count: 90 }, isVerified: true, foundedYear: 2006, description: 'Supporting fishing communities in Ramanathapuram with disaster relief and healthcare.' },
    { _id: 'd20', name: 'Thoothukudi Port Community Foundation', serviceCategories: ['Skill Development', 'Environmental', 'Education'], location: { type: 'Point', coordinates: [78.1348, 8.7642], city: 'Thoothukudi', state: 'Tamil Nadu', address: '67, Harbour Estate, Thoothukudi' }, phone: '0461-2234573', rating: { average: 4.4, count: 78 }, isVerified: true, foundedYear: 2010, description: 'Improving livelihoods of port workers and coastal communities in Thoothukudi.' },
];

const ALL_CATEGORIES = [
    'Education', 'Healthcare', 'Food & Nutrition', 'Shelter',
    'Women Empowerment', 'Child Welfare', 'Environmental',
    'Disaster Relief', 'Elderly Care', 'Skill Development', 'Legal Aid'
];

// Reverse geocode lat/lng → address string using Nominatim
const reverseGeocode = async (lat, lng) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

// Calculate distance between two lat/lng points (Haversine)
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

// ─── Main Component ───────────────────────────────────────────────────────────
const NGOMapSearch = () => {
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [radius, setRadius] = useState(100);
    const [category, setCategory] = useState('');
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchCenter, setSearchCenter] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [usingDummy, setUsingDummy] = useState(false);
    const [selectedNgoId, setSelectedNgoId] = useState(null);

    // On mount, show all Tamil Nadu NGOs as default
    useEffect(() => {
        setNgos(DUMMY_NGOS);
        setUsingDummy(true);
    }, []);

    // ── Handle map click → reverse geocode → fill address ──────────────────────
    const handleMapClick = useCallback(async (latlng) => {
        const addr = await reverseGeocode(latlng.lat, latlng.lng);
        setAddress(addr);
        setSearchCenter({ lat: latlng.lat, lng: latlng.lng, address: addr });
    }, []);

    // ── Use browser geolocation ─────────────────────────────────────────────────
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setUserLocation({ lat, lng });
                const addr = await reverseGeocode(lat, lng);
                setAddress(addr);
                setSearchCenter({ lat, lng, address: addr });
                setLoading(false);
            },
            () => {
                setError('Could not get your location. Please enter it manually.');
                setLoading(false);
            }
        );
    };

    // ── Search NGOs ─────────────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!address.trim()) {
            setError('Please enter an address or click on the map.');
            return;
        }
        setError('');
        setLoading(true);
        setHasSearched(true);

        try {
            const params = { address: address.trim(), radius };
            if (category) params.category = category;

            const res = await axios.get('/api/ngos/by-address', { params });
            const data = res.data;

            if (data.success) {
                setNgos(data.data);
                setSearchCenter({
                    lat: data.searchCenter.lat,
                    lng: data.searchCenter.lng,
                    address: data.searchCenter.address
                });
                setUsingDummy(false);
            }
        } catch (err) {
            // Fallback: filter dummy data by distance
            console.warn('Backend unavailable, using dummy data:', err.message);
            setUsingDummy(true);

            // Try to geocode the address client-side for filtering
            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=in`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    const lat = parseFloat(geoData[0].lat);
                    const lng = parseFloat(geoData[0].lon);
                    setSearchCenter({ lat, lng, address });

                    let filtered = DUMMY_NGOS.filter(ngo => {
                        const ngoLng = ngo.location.coordinates[0];
                        const ngoLat = ngo.location.coordinates[1];
                        return calcDistance(lat, lng, ngoLat, ngoLng) <= parseFloat(radius);
                    });

                    if (category) {
                        filtered = filtered.filter(ngo =>
                            ngo.serviceCategories.includes(category)
                        );
                    }

                    // Sort by distance
                    filtered.sort((a, b) => {
                        const da = calcDistance(lat, lng, a.location.coordinates[1], a.location.coordinates[0]);
                        const db = calcDistance(lat, lng, b.location.coordinates[1], b.location.coordinates[0]);
                        return da - db;
                    });

                    setNgos(filtered);
                } else {
                    setError('Address not found. Try a different search term.');
                    setNgos([]);
                }
            } catch {
                setError('Search failed. Please check your connection.');
                setNgos([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleMarkerClick = (ngoId) => {
        navigate(`/ngos/${ngoId}`);
    };

    const formatRating = (rating) => {
        if (!rating) return 'N/A';
        if (typeof rating === 'object') return rating.average?.toFixed(1) || 'N/A';
        return parseFloat(rating).toFixed(1);
    };

    const getDistanceText = (ngo) => {
        if (!searchCenter) return '';
        const d = calcDistance(
            searchCenter.lat, searchCenter.lng,
            ngo.location.coordinates[1], ngo.location.coordinates[0]
        );
        return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
    };

    return (
        <div className="ngo-map-page">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="ngo-map-header">
                <div className="header-content">
                    <h1>🗺️ Find NGOs Near You</h1>
                    <p>Click on the map to set your location, or type an address below</p>
                </div>
                <div className="header-stats">
                    <div className="stat-pill">
                        <span className="stat-num">{ngos.length}</span>
                        <span className="stat-lbl">NGOs Found</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">38</span>
                        <span className="stat-lbl">TN Districts</span>
                    </div>
                </div>
            </div>

            {/* ── Search Bar ─────────────────────────────────────────────────────── */}
            <div className="ngo-map-searchbar">
                <div className="search-row">
                    <div className="search-input-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter district, city, or click on the map..."
                            className="search-address-input"
                        />
                        {address && (
                            <button className="clear-btn" onClick={() => { setAddress(''); setSearchCenter(null); }}>✕</button>
                        )}
                    </div>

                    <select
                        value={radius}
                        onChange={e => setRadius(e.target.value)}
                        className="search-radius-select"
                    >
                        <option value={10}>Within 10 km</option>
                        <option value={25}>Within 25 km</option>
                        <option value={50}>Within 50 km</option>
                        <option value={100}>Within 100 km</option>
                        <option value={200}>Within 200 km</option>
                        <option value={500}>Entire Tamil Nadu</option>
                    </select>

                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="search-category-select"
                    >
                        <option value="">All Categories</option>
                        {ALL_CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <button
                        className="btn-my-location"
                        onClick={handleUseMyLocation}
                        title="Use my current location"
                    >
                        📍 My Location
                    </button>

                    <button
                        className="btn-search"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : 'Search'}
                    </button>
                </div>

                {error && <div className="search-error">⚠️ {error}</div>}
                {usingDummy && hasSearched && (
                    <div className="dummy-notice">
                        ℹ️ Showing local Tamil Nadu NGO data (backend offline)
                    </div>
                )}
            </div>

            {/* ── Main Content: Map + Results ─────────────────────────────────────── */}
            <div className="ngo-map-body">
                {/* Results Panel */}
                <div className="results-panel">
                    <div className="results-panel-header">
                        <h2>
                            {hasSearched ? `${ngos.length} NGO${ngos.length !== 1 ? 's' : ''} Found` : 'Tamil Nadu NGOs'}
                        </h2>
                        {searchCenter && (
                            <p className="search-location-label">
                                📍 {searchCenter.address?.substring(0, 60)}
                                {searchCenter.address?.length > 60 ? '…' : ''}
                            </p>
                        )}
                    </div>

                    <div className="results-list">
                        {ngos.length === 0 && hasSearched ? (
                            <div className="no-results">
                                <div className="no-results-icon">🔍</div>
                                <h3>No NGOs found</h3>
                                <p>Try increasing the radius or changing the category filter.</p>
                            </div>
                        ) : (
                            ngos.map(ngo => (
                                <div
                                    key={ngo._id}
                                    className={`result-card ${selectedNgoId === ngo._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedNgoId(ngo._id)}
                                >
                                    <div className="result-card-top">
                                        <div className="result-name-row">
                                            <h3>{ngo.name}</h3>
                                            {ngo.isVerified && <span className="verified-chip">✓</span>}
                                        </div>
                                        {searchCenter && (
                                            <span className="distance-chip">{getDistanceText(ngo)}</span>
                                        )}
                                    </div>

                                    <div className="result-categories">
                                        {(ngo.serviceCategories || []).slice(0, 3).map(cat => (
                                            <span
                                                key={cat}
                                                className="cat-badge"
                                                style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="result-location">
                                        📍 {ngo.location?.city}, {ngo.location?.state}
                                    </p>

                                    <div className="result-meta">
                                        <span>⭐ {formatRating(ngo.rating)}</span>
                                        {ngo.foundedYear && <span>🗓️ Est. {ngo.foundedYear}</span>}
                                        <span>📞 {ngo.phone || 'N/A'}</span>
                                    </div>

                                    <button
                                        className="result-view-btn"
                                        onClick={(e) => { e.stopPropagation(); navigate(`/ngos/${ngo._id}`); }}
                                    >
                                        View Details →
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Map Panel */}
                <div className="map-panel">
                    <LeafletMap
                        ngos={ngos}
                        userLocation={userLocation}
                        searchCenter={searchCenter}
                        searchRadius={searchCenter ? parseFloat(radius) : null}
                        height="100%"
                        onMarkerClick={handleMarkerClick}
                        onMapClick={handleMapClick}
                        defaultCenter={{ lat: 11.1271, lng: 78.6569 }}
                        defaultZoom={7}
                    />
                </div>
            </div>
        </div>
    );
};

export default NGOMapSearch;
