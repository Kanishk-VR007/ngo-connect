import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServiceRequests.css';

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/requests');
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="requests-page">
      <div className="container">
        <h1>Service Requests</h1>

        <div className="requests-list">
          {requests.length > 0 ? (
            requests.map(request => (
              <div key={request._id} className="card request-card">
                <div className="request-header">
                  <h3>{request.title}</h3>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="request-description">{request.description}</p>

                <div className="request-info">
                  <p><strong>NGO:</strong> {request.ngoId?.name}</p>
                  <p><strong>Category:</strong> {request.serviceCategory}</p>
                  <p><strong>Urgency:</strong> {request.urgency}</p>
                  <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No service requests found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequests;
