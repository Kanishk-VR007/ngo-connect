import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/analytics/dashboard');
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">Role: {user?.role}</p>

        {user?.role === 'user' && analytics && (
          <div className="dashboard-content">
            <div className="grid grid-3">
              <div className="stat-card">
                <h3>{analytics.totalRequests || 0}</h3>
                <p>Total Requests</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.donations?.count || 0}</h3>
                <p>Donations Made</p>
              </div>
              <div className="stat-card">
                <h3>₹{analytics.donations?.totalAmount || 0}</h3>
                <p>Total Donated</p>
              </div>
            </div>

            <div className="card">
              <h2>Recent Requests</h2>
              {analytics.recentRequests && analytics.recentRequests.length > 0 ? (
                <div className="request-list">
                  {analytics.recentRequests.map(request => (
                    <div key={request._id} className="request-item">
                      <h4>{request.title}</h4>
                      <p>{request.description}</p>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No requests yet</p>
              )}
            </div>
          </div>
        )}

        {user?.role === 'ngo_member' && analytics && (
          <div className="dashboard-content">
            <div className="grid grid-3">
              <div className="stat-card">
                <h3>{analytics.pendingRequests || 0}</h3>
                <p>Pending Requests</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.completedRequests || 0}</h3>
                <p>Completed Requests</p>
              </div>
              <div className="stat-card">
                <h3>₹{analytics.monthlyDonations || 0}</h3>
                <p>This Month Donations</p>
              </div>
            </div>

            <div className="card">
              <h2>Recent Service Requests</h2>
              {analytics.recentRequests && analytics.recentRequests.length > 0 ? (
                <div className="request-list">
                  {analytics.recentRequests.map(request => (
                    <div key={request._id} className="request-item">
                      <h4>{request.title}</h4>
                      <p>Requested by: {request.requestedBy?.name}</p>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No requests yet</p>
              )}
            </div>
          </div>
        )}

        {user?.role === 'admin' && analytics && (
          <div className="dashboard-content">
            <div className="grid grid-3">
              <div className="stat-card">
                <h3>{analytics.totalNGOs || 0}</h3>
                <p>Total NGOs</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.totalRequests || 0}</h3>
                <p>Total Requests</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
