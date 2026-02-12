import React, { useEffect, useRef, useState } from 'react';
import './GoogleMap.css';

const GoogleMap = ({ ngos, center, zoom = 12, height = '400px', onMarkerClick }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: center || { lat: 40.7128, lng: -74.0060 }, // Default to New York
      zoom: zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);
  }, [center, zoom]);

  useEffect(() => {
    if (!map || !ngos || ngos.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create info window
    const infoWindow = new window.google.maps.InfoWindow();

    // Add markers for each NGO
    const newMarkers = ngos.map(ngo => {
      const marker = new window.google.maps.Marker({
        position: {
          lat: ngo.location?.coordinates?.[1] || 0,
          lng: ngo.location?.coordinates?.[0] || 0
        },
        map: map,
        title: ngo.name,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        const contentString = `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 10px 0; color: #2563eb; font-size: 16px;">${ngo.name}</h3>
            <p style="margin: 5px 0; font-size: 13px; color: #666;">
              <strong>Categories:</strong> ${ngo.categories?.join(', ') || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 13px; color: #666;">
              <strong>Rating:</strong> ⭐ ${ngo.rating || 'N/A'}/5
            </p>
            <p style="margin: 5px 0; font-size: 13px; color: #666;">
              <strong>Address:</strong> ${ngo.address || 'N/A'}
            </p>
            <p style="margin: 5px 0; font-size: 13px; color: #666;">
              <strong>Phone:</strong> ${ngo.phone || 'N/A'}
            </p>
            ${onMarkerClick ? `
              <button 
                onclick="window.ngoMarkerClick('${ngo._id}')"
                style="
                  margin-top: 10px;
                  padding: 8px 16px;
                  background: #2563eb;
                  color: white;
                  border: none;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 13px;
                "
              >
                View Details
              </button>
            ` : ''}
          </div>
        `;

        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);

        if (onMarkerClick) {
          window.ngoMarkerClick = (id) => onMarkerClick(id);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
      
      // Don't zoom in too much for single marker
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      });
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, ngos, onMarkerClick]);

  return (
    <div className="google-map-container">
      <div ref={mapRef} style={{ width: '100%', height: height, borderRadius: '8px' }} />
    </div>
  );
};

export default GoogleMap;
