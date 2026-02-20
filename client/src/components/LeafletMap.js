import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    Circle,
    ZoomControl
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';

// Fix Leaflet default icon paths (broken in CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Category → color mapping
const CATEGORY_COLORS = {
    'Education': '#3b82f6',
    'Healthcare': '#ef4444',
    'Food & Nutrition': '#f59e0b',
    'Shelter': '#8b5cf6',
    'Women Empowerment': '#ec4899',
    'Child Welfare': '#06b6d4',
    'Environmental': '#10b981',
    'Disaster Relief': '#f97316',
    'Elderly Care': '#6366f1',
    'Skill Development': '#84cc16',
    'Legal Aid': '#a78bfa',
    'Other': '#6b7280'
};

// Create a colored SVG marker icon for a category
const createCategoryIcon = (category) => {
    const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z"
        fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
    </svg>
  `;
    return L.divIcon({
        html: svg,
        className: 'custom-ngo-marker',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -44]
    });
};

// User location icon (blue pulsing)
const userLocationIcon = L.divIcon({
    html: `
    <div class="user-location-pin">
      <div class="user-location-dot"></div>
      <div class="user-location-pulse"></div>
    </div>
  `,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Search center icon (crosshair)
const searchCenterIcon = L.divIcon({
    html: `<div class="search-center-pin">📍</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28]
});

// ─── Click Handler Component ────────────────────────────────────────────────
const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (onMapClick) onMapClick(e.latlng);
        }
    });
    return null;
};

// ─── Map Recenter Component ─────────────────────────────────────────────────
const MapRecenter = ({ center, zoom }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
        }
    }, [center, zoom, map]);
    return null;
};

// ─── Main LeafletMap Component ──────────────────────────────────────────────
const LeafletMap = ({
    ngos = [],
    userLocation = null,
    searchCenter = null,
    searchRadius = null,
    height = '500px',
    onMarkerClick,
    onMapClick,
    defaultCenter = { lat: 11.1271, lng: 78.6569 }, // Tamil Nadu center
    defaultZoom = 7
}) => {
    const [selectedNgo, setSelectedNgo] = useState(null);

    const handleMarkerClick = useCallback((ngo) => {
        setSelectedNgo(ngo);
    }, []);

    const getPrimaryCategory = (ngo) => {
        return ngo.serviceCategories?.[0] || 'Other';
    };

    const formatRating = (rating) => {
        if (!rating) return 'N/A';
        if (typeof rating === 'object') return rating.average?.toFixed(1) || 'N/A';
        return parseFloat(rating).toFixed(1);
    };

    return (
        <div className="leaflet-map-wrapper" style={{ height }}>
            <MapContainer
                center={[defaultCenter.lat, defaultCenter.lng]}
                zoom={defaultZoom}
                style={{ width: '100%', height: '100%', borderRadius: '12px' }}
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Click handler */}
                <MapClickHandler onMapClick={onMapClick} />

                {/* Recenter when searchCenter changes */}
                {searchCenter && (
                    <MapRecenter
                        center={[searchCenter.lat, searchCenter.lng]}
                        zoom={searchRadius > 30 ? 9 : searchRadius > 10 ? 10 : 12}
                    />
                )}

                {/* Search radius circle */}
                {searchCenter && searchRadius && (
                    <Circle
                        center={[searchCenter.lat, searchCenter.lng]}
                        radius={searchRadius * 1000}
                        pathOptions={{
                            color: '#6366f1',
                            fillColor: '#6366f1',
                            fillOpacity: 0.06,
                            weight: 2,
                            dashArray: '6 4'
                        }}
                    />
                )}

                {/* Search center marker */}
                {searchCenter && (
                    <Marker
                        position={[searchCenter.lat, searchCenter.lng]}
                        icon={searchCenterIcon}
                    >
                        <Popup>
                            <div className="map-popup-center">
                                <strong>📍 Search Location</strong>
                                <p>{searchCenter.address}</p>
                                <small>Radius: {searchRadius} km</small>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* User location marker */}
                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={userLocationIcon}
                    >
                        <Popup>
                            <div className="map-popup-user">
                                <strong>🔵 Your Location</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* NGO markers */}
                {ngos.map((ngo) => {
                    const lat = ngo.location?.coordinates?.[1];
                    const lng = ngo.location?.coordinates?.[0];
                    if (!lat || !lng) return null;

                    const primaryCat = getPrimaryCategory(ngo);
                    const icon = createCategoryIcon(primaryCat);

                    return (
                        <Marker
                            key={ngo._id}
                            position={[lat, lng]}
                            icon={icon}
                            eventHandlers={{ click: () => handleMarkerClick(ngo) }}
                        >
                            <Popup maxWidth={280} className="ngo-popup">
                                <div className="ngo-popup-content">
                                    <div className="ngo-popup-header">
                                        <h3>{ngo.name}</h3>
                                        {ngo.isVerified && <span className="popup-verified">✓ Verified</span>}
                                    </div>

                                    <div className="ngo-popup-categories">
                                        {(ngo.serviceCategories || []).slice(0, 3).map(cat => (
                                            <span
                                                key={cat}
                                                className="popup-category-badge"
                                                style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="ngo-popup-info">
                                        <p>📍 {ngo.location?.city}, {ngo.location?.state}</p>
                                        <p>📞 {ngo.phone || 'N/A'}</p>
                                        <p>⭐ {formatRating(ngo.rating)} / 5</p>
                                        {ngo.foundedYear && <p>🗓️ Founded: {ngo.foundedYear}</p>}
                                    </div>

                                    <p className="ngo-popup-desc">
                                        {ngo.description?.substring(0, 100)}...
                                    </p>

                                    {onMarkerClick && (
                                        <button
                                            className="popup-view-btn"
                                            onClick={() => onMarkerClick(ngo._id)}
                                        >
                                            View Details →
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Category Legend */}
            <div className="map-legend">
                <div className="legend-title">Categories</div>
                {Object.entries(CATEGORY_COLORS).slice(0, 8).map(([cat, color]) => (
                    <div key={cat} className="legend-item">
                        <span className="legend-dot" style={{ background: color }} />
                        <span className="legend-label">{cat}</span>
                    </div>
                ))}
            </div>

            {/* Click hint */}
            <div className="map-click-hint">
                🖱️ Click anywhere on the map to set your search location
            </div>
        </div>
    );
};

export { CATEGORY_COLORS };
export default LeafletMap;
