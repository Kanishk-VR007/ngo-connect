import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import GoogleMap from '../components/GoogleMap';
import './NGOList.css';

const NGOList = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    distance: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchNGOs();
    getUserLocation();
  }, [filters]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  };

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/ngos';
      
      // Use nearby endpoint if distance filter and user location are available
      if (filters.distance && userLocation) {
        url = `http://localhost:5000/api/ngos/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&distance=${filters.distance}`;
      }
      
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      
      const response = await axios.get(url, { params });
      setNgos(response.data);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleMarkerClick = (ngoId) => {
    navigate(`/ngos/${ngoId}`);
  };

  if (loading) {
    return <div className="loading">Loading NGOs...</div>;
  }

  return (
    <div className="ngo-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Find NGOs Near You</h1>
          <div className="view-toggle">
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              📋 List View
            </button>
            <button 
              className={viewMode === 'map' ? 'active' : ''} 
              onClick={() => setViewMode('map')}
            >
              🗺️ Map View
            </button>
          </div>
        </div>

        <div className="filters card">
          <div className="grid grid-4">
            <div className="input-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search NGO name..."
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Food & Nutrition">Food & Nutrition</option>
                <option value="Shelter">Shelter</option>
                <option value="Women Empowerment">Women Empowerment</option>
                <option value="Child Welfare">Child Welfare</option>
                <option value="Environmental">Environmental</option>
                <option value="Disaster Relief">Disaster Relief</option>
                <option value="Skill Development">Skill Development</option>
              </select>
            </div>

            <div className="input-group">
              <label>Distance (km)</label>
              <select name="distance" value={filters.distance} onChange={handleFilterChange}>
                <option value="">Any Distance</option>
                <option value="5">Within 5 km</option>
                <option value="10">Within 10 km</option>
                <option value="25">Within 25 km</option>
                <option value="50">Within 50 km</option>
                <option value="100">Within 100 km</option>
              </select>
            </div>

            <div className="input-group">
              <label>Results</label>
              <div className="results-count">
                Found {ngos.length} NGO{ngos.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {viewMode === 'map' && (
          <div className="map-section">
            <GoogleMap 
              ngos={ngos}
              center={userLocation}
              height="500px"
              onMarkerClick={handleMarkerClick}
            />
          </div>
        )}

        {viewMode === 'list' && (
          <div className="ngo-grid">
            {ngos.length > 0 ? (
              ngos.map(ngo => (
                <div key={ngo._id} className="ngo-card">
                  <div className="ngo-card-header">
                    {ngo.logo && (
                      <img src={ngo.logo} alt={ngo.name} className="ngo-logo" />
                    )}
                    <h3>{ngo.name}</h3>
                    {ngo.isVerified && <span className="verified-badge">✓ Verified</span>}
                  </div>

                  <p className="ngo-description">
                    {ngo.description?.substring(0, 150)}...
                  </p>

                  <div className="ngo-info">
                    <p><strong>📍 Location:</strong> {ngo.location?.city}, {ngo.location?.state}</p>
                    <p><strong>📂 Categories:</strong> {ngo.serviceCategories?.join(', ') || 'N/A'}</p>
                    {ngo.foundedYear && (
                      <p><strong>⏱️ Founded:</strong> {ngo.foundedYear}</p>
                    )}
                    {ngo.rating && (
                      <p><strong>⭐ Rating:</strong> {ngo.rating.toFixed(1)}/5</p>
                    )}
                  </div>

                  <div className="ngo-stats">
                    <div className="stat">
                      <span className="stat-value">{ngo.statistics?.projectsCompleted || 0}</span>
                      <span className="stat-label">Projects</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{ngo.statistics?.peopleHelped?.toLocaleString() || 0}</span>
                      <span className="stat-label">Helped</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{ngo.statistics?.volunteersCount || 0}</span>
                      <span className="stat-label">Volunteers</span>
                    </div>
                  </div>

                  <Link to={`/ngos/${ngo._id}`} className="btn btn-primary full-width">
                    View Details →
                  </Link>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No NGOs found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NGOList;
