import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Donations.css';

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await axios.get('/api/donations');
      setDonations(response.data.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading donations...</div>;
  }

  return (
    <div className="donations-page">
      <div className="container">
        <h1>Donation History</h1>

        <div className="donations-list">
          {donations.length > 0 ? (
            donations.map(donation => (
              <div key={donation._id} className="card donation-card">
                <div className="donation-header">
                  <h3>₹{donation.amount}</h3>
                  <span className={`status-badge status-${donation.status}`}>
                    {donation.status}
                  </span>
                </div>

                <div className="donation-info">
                  <p><strong>NGO:</strong> {donation.ngoId?.name}</p>
                  <p><strong>Purpose:</strong> {donation.purpose}</p>
                  <p><strong>Type:</strong> {donation.donationType.replace('_', ' ')}</p>
                  <p><strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>
                  {donation.transactionId && (
                    <p><strong>Transaction ID:</strong> {donation.transactionId}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No donations found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Donations;
