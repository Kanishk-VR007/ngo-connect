import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LeafletMap from '../components/LeafletMap';
import LoadingScreen from '../components/LoadingScreen';
import NearbyNGOs from '../components/NearbyNGOs';
import './NGOList.css';

const NGOList = () => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNGOs();
    getUserLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied:', error)
      );
    }
  };

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/ngos', {
        params: { limit: 100 }
      });
      const data = response.data;
      if (data && data.success && Array.isArray(data.data)) {
        setNgos(data.data);
      } else if (Array.isArray(data)) {
        setNgos(data);
      } else {
        setNgos([]);
      }
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      setNgos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (ngoId) => {
    navigate(`/ngos/${ngoId}`);
  };

  if (loading) {
    return <LoadingScreen message="Finding NGOs near you..." />;
  }

  return (
    <div className="ngo-list-page">
      <div className="container">

        {/* Nearby NGOs by Category — full featured section */}
        <NearbyNGOs radiusKm={300} />

      </div>
    </div>
  );
};

export default NGOList;
