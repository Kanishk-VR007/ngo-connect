import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './NGODetail.css';

const NGODetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [requestData, setRequestData] = useState({
    serviceCategory: '',
    title: '',
    description: '',
    urgency: 'medium'
  });

  useEffect(() => {
    fetchNGODetails();
  }, [id]);

  const fetchNGODetails = async () => {
    try {
      const response = await axios.get(`/api/ngos/${id}`);
      setNgo(response.data.data);
    } catch (error) {
      console.error('Error fetching NGO details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/requests', {
        ...requestData,
        ngoId: id
      });
      alert('Service request submitted successfully!');
      setShowRequestForm(false);
      setRequestData({ serviceCategory: '', title: '', description: '', urgency: 'medium' });
    } catch (error) {
      alert('Error submitting request');
    }
  };

  const handleApplyToNGO = async () => {
    try {
      await axios.post(`/api/ngos/${id}/apply`, {
        message: 'I would like to join your organization',
        position: 'Volunteer'
      });
      alert('Application submitted successfully!');
      setShowApplicationForm(false);
    } catch (error) {
      alert(error.response?.data?.error || 'Error submitting application');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!ngo) {
    return <div className="container">NGO not found</div>;
  }

  return (
    <div className="ngo-detail-page">
      <div className="container">
        <div className="ngo-header">
          {ngo.logo && <img src={ngo.logo} alt={ngo.name} className="ngo-logo-large" />}
          <div>
            <h1>
              {ngo.name}
              {ngo.isVerified && <span className="verified-badge">✓ Verified</span>}
            </h1>
            <p className="ngo-location">📍 {ngo.location.address}, {ngo.location.city}, {ngo.location.state}</p>
          </div>
        </div>

        <div className="grid grid-2">
          <div>
            <div className="card">
              <h2>About</h2>
              <p>{ngo.description}</p>
              <div className="ngo-meta">
                <p><strong>Registration No:</strong> {ngo.registrationNumber}</p>
                <p><strong>Founded:</strong> {ngo.foundedYear}</p>
                <p><strong>Team Size:</strong> {ngo.teamSize} members</p>
                <p><strong>Email:</strong> {ngo.email}</p>
                <p><strong>Phone:</strong> {ngo.phone}</p>
                {ngo.website && <p><strong>Website:</strong> <a href={ngo.website} target="_blank" rel="noopener noreferrer">{ngo.website}</a></p>}
              </div>
            </div>

            <div className="card">
              <h2>Services</h2>
              <div className="service-tags">
                {ngo.serviceCategories.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
              </div>
            </div>

            {isAuthenticated && (
              <div className="card actions">
                <button className="btn btn-primary" onClick={() => setShowRequestForm(true)}>
                  Request Service
                </button>
                {user?.role === 'user' && (
                  <button className="btn btn-success" onClick={() => setShowApplicationForm(true)}>
                    Apply to Join
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <h2>Impact Statistics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <h3>{ngo.statistics.peopleHelped}</h3>
                  <p>People Helped</p>
                </div>
                <div className="stat-item">
                  <h3>{ngo.statistics.projectsCompleted}</h3>
                  <p>Projects Completed</p>
                </div>
                <div className="stat-item">
                  <h3>₹{ngo.statistics.donationsReceived}</h3>
                  <p>Donations Received</p>
                </div>
                <div className="stat-item">
                  <h3>{ngo.statistics.volunteersEngaged}</h3>
                  <p>Volunteers</p>
                </div>
              </div>
            </div>

            {ngo.rating.count > 0 && (
              <div className="card">
                <h2>Rating</h2>
                <div className="rating-display">
                  <span className="rating-number">{ngo.rating.average.toFixed(1)}</span>
                  <span className="rating-stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-count">({ngo.rating.count} reviews)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showRequestForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>Request Service</h2>
              <form onSubmit={handleRequestSubmit}>
                <div className="input-group">
                  <label>Service Category</label>
                  <select
                    value={requestData.serviceCategory}
                    onChange={(e) => setRequestData({ ...requestData, serviceCategory: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {ngo.serviceCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={requestData.title}
                    onChange={(e) => setRequestData({ ...requestData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    value={requestData.description}
                    onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                    rows="4"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Urgency</label>
                  <select
                    value={requestData.urgency}
                    onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Submit Request</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showApplicationForm && (
          <div className="modal">
            <div className="modal-content">
              <h2>Apply to Join {ngo.name}</h2>
              <p>Are you sure you want to apply to become a member of this NGO?</p>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleApplyToNGO}>
                  Yes, Apply
                </button>
                <button className="btn btn-secondary" onClick={() => setShowApplicationForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NGODetail;
