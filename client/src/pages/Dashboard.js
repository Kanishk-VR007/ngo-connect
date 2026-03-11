import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Animated counter hook
const useCountUp = (target, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [processingApp, setProcessingApp] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good Morning');
    else if (h < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (user?.role === 'ngo_founder' && user?.ngoId) {
      fetchApplications();
    }
  }, [user]);

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

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`/api/ngos/${user.ngoId}/applications?status=pending`);
      setApplications(res.data.data || []);
    } catch (err) { console.error('Fetch applications error:', err); }
  };

  const handleApplication = async (ngoId, appId, status) => {
    setProcessingApp(appId);
    try {
      await axios.put(`/api/ngos/${ngoId}/applications/${appId}`, { status });
      setApplications(prev => prev.filter(a => a._id !== appId));
    } catch (err) {
      console.error('Handle application error:', err);
    } finally {
      setProcessingApp(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-orb" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const roleLabel = {
    'user': 'Community Member',
    'ngo_founder': 'NGO Founder',
    'ngo_member': 'NGO Member',
    'admin': 'Administrator'
  }[user?.role] || user?.role;

  return (
    <div className="dashboard-page">
      {/* Animated background */}
      <div className="dash-bg" />

      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dash-welcome-card">
          <div className="dash-welcome-left">
            <div className="dash-avatar">
              <img
                src={user?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                alt={user?.name}
              />
              <div className="dash-avatar-ring" />
            </div>
            <div className="dash-welcome-text">
              <p className="greeting-text">{greeting}, 👋</p>
              <h1 className="welcome-name">{user?.name}!</h1>
              <div className="role-badge-row">
                <span className={`role-badge role-${user?.role}`}>
                  {user?.role === 'ngo_founder' ? '🏛' :
                    user?.role === 'ngo_member' ? '👥' :
                      user?.role === 'admin' ? '🛡' : '👤'}&nbsp;
                  {roleLabel}
                </span>
                {user?.ngoId && user?.role !== 'user' && (
                  <span className="ngo-badge-dash">🏢 NGO Active</span>
                )}
              </div>
            </div>
          </div>
          <div className="dash-quick-actions">
            <Link to="/find-ngos" className="quick-action-btn qa-blue">
              <span>🔍</span><span>Find NGOs</span>
            </Link>
            {user?.role === 'user' && (
              <Link to="/join-ngo" className="quick-action-btn qa-green">
                <span>➕</span><span>Join an NGO</span>
              </Link>
            )}
            {(user?.role === 'ngo_founder' || user?.role === 'ngo_member') && (
              <Link to="/requests" className="quick-action-btn qa-purple">
                <span>📨</span><span>View Requests</span>
              </Link>
            )}
            {user?.role === 'ngo_founder' && !user?.ngoId && (
              <Link to="/create-ngo" className="quick-action-btn qa-gold">
                <span>🏛</span><span>Create NGO</span>
              </Link>
            )}
          </div>
        </div>

        {/* ===== USER DASHBOARD ===== */}
        {user?.role === 'user' && analytics && (
          <UserDashboard analytics={analytics} user={user} />
        )}

        {/* ===== NGO MEMBER DASHBOARD ===== */}
        {user?.role === 'ngo_member' && analytics && (
          <MemberDashboard analytics={analytics} user={user} />
        )}

        {/* ===== NGO FOUNDER DASHBOARD ===== */}
        {user?.role === 'ngo_founder' && analytics && (
          <FounderDashboard analytics={analytics} user={user}
            applications={applications} onHandleApp={handleApplication} processingApp={processingApp} />
        )}

        {/* ===== ADMIN DASHBOARD ===== */}
        {user?.role === 'admin' && analytics && (
          <AdminDashboard analytics={analytics} />
        )}
      </div>
    </div>
  );
};

/* --------- USER DASHBOARD --------- */
const UserDashboard = ({ analytics, user }) => {
  const totalReq = useCountUp(analytics.totalRequests || 0);
  const donations = useCountUp(analytics.donations?.count || 0);
  const amount = useCountUp(analytics.donations?.totalAmount || 0);

  return (
    <div className="dash-sections">
      <div className="stat-cards-row">
        <StatCard icon="📨" label="Total Requests" value={totalReq} color="blue" />
        <StatCard icon="💝" label="Donations Made" value={donations} color="purple" />
        <StatCard icon="₹" label="Total Donated" value={`₹${amount}`} color="green" />
        <StatCard icon="👥" label="NGOs Followed" value={user.membershipStatus === 'active' ? 1 : 0} color="orange" />
      </div>

      {/* Membership Status */}
      {user.membershipStatus === 'pending' && (
        <div className="dash-card status-card pending">
          <div className="status-icon">⏳</div>
          <div>
            <h3>Membership Application Pending</h3>
            <p>Your application to join an NGO is under review. You'll be notified once approved.</p>
          </div>
        </div>
      )}
      {user.membershipStatus === 'rejected' && (
        <div className="dash-card status-card rejected">
          <div className="status-icon">❌</div>
          <div>
            <h3>Application Not Approved</h3>
            <p>Your previous application was rejected. You can apply to a different NGO.</p>
            <Link to="/join-ngo" className="dash-link-btn">Browse NGOs →</Link>
          </div>
        </div>
      )}

      <div className="dash-row-2">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Requests</h2>
            <Link to="/requests" className="view-all-link">View all →</Link>
          </div>
          {analytics.recentRequests?.length > 0 ? (
            <div className="request-list">
              {analytics.recentRequests.map(r => (
                <div key={r._id} className="request-item">
                  <div className="req-icon">📋</div>
                  <div className="req-info">
                    <h4>{r.title}</h4>
                    <p>{r.description?.slice(0, 80)}...</p>
                  </div>
                  <span className={`status-pill s-${r.status}`}>{r.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No requests yet.</p>
              <Link to="/events" className="dash-link-btn">Browse Events</Link>
            </div>
          )}
        </div>

        <div className="dash-card">
          <div className="dash-card-header"><h2>Quick Actions</h2></div>
          <div className="quick-actions-grid">
            <Link to="/events" className="qa-grid-item qa-blue"><span>🎪</span><span>Browse Events</span></Link>
            <Link to="/donations" className="qa-grid-item qa-green"><span>💸</span><span>Donate Now</span></Link>
            <Link to="/map-search" className="qa-grid-item qa-purple"><span>🗺</span><span>Map Search</span></Link>
            <Link to="/join-ngo" className="qa-grid-item qa-orange"><span>🤝</span><span>Join an NGO</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------- NGO MEMBER DASHBOARD --------- */
const MemberDashboard = ({ analytics, user }) => {
  const pending = useCountUp(analytics.pendingRequests || 0);
  const completed = useCountUp(analytics.completedRequests || 0);
  const monthly = useCountUp(analytics.monthlyDonations || 0);

  return (
    <div className="dash-sections">
      <div className="member-badge-card dash-card">
        <div className="member-badge-icon">🏅</div>
        <div>
          <h3>NGO Member</h3>
          <p>You're an active member. You can manage service requests and help coordinate events for your NGO.</p>
        </div>
      </div>

      <div className="stat-cards-row">
        <StatCard icon="⏳" label="Pending Requests" value={pending} color="orange" />
        <StatCard icon="✅" label="Completed" value={completed} color="green" />
        <StatCard icon="₹" label="Monthly Donations" value={`₹${monthly}`} color="purple" />
      </div>

      <div className="dash-row-2">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Service Requests</h2>
            <Link to="/requests" className="view-all-link">View all →</Link>
          </div>
          {analytics.recentRequests?.length > 0 ? (
            <div className="request-list">
              {analytics.recentRequests.map(r => (
                <div key={r._id} className="request-item">
                  <div className="req-icon">📋</div>
                  <div className="req-info">
                    <h4>{r.title}</h4>
                    <p>By: {r.requestedBy?.name}</p>
                  </div>
                  <span className={`status-pill s-${r.status}`}>{r.status}</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><div className="empty-icon">📭</div><p>No requests yet</p></div>}
        </div>

        <div className="dash-card">
          <div className="dash-card-header"><h2>Member Actions</h2></div>
          <div className="quick-actions-grid">
            <Link to="/requests" className="qa-grid-item qa-blue"><span>📋</span><span>Requests</span></Link>
            <Link to="/events" className="qa-grid-item qa-green"><span>🎪</span><span>Events</span></Link>
            <Link to="/donations" className="qa-grid-item qa-purple"><span>💸</span><span>Donations</span></Link>
            <Link to="/profile" className="qa-grid-item qa-orange"><span>👤</span><span>My Profile</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------- NGO FOUNDER DASHBOARD --------- */
const FounderDashboard = ({ analytics, user, applications, onHandleApp, processingApp }) => {
  const totalNGO = useCountUp(analytics.totalRequests || 0);
  const volunteers = useCountUp(analytics.volunteersEngaged || 0);
  const donations = useCountUp(analytics.donationsReceived || 0);
  const helped = useCountUp(analytics.peopleHelped || 0);

  return (
    <div className="dash-sections">
      {/* Founder ownership badge */}
      <div className="founder-ownership-card">
        <div className="fo-icon">👑</div>
        <div className="fo-text">
          <h3>NGO Founder <span className="founder-ownership-tag">Owner</span></h3>
          <p>You have full control over your NGO. Ownership credentials and administrative rights are exclusively yours.</p>
        </div>
        {user.ngoId && (
          <Link to={`/ngos/${user.ngoId}`} className="fo-btn">View NGO Profile →</Link>
        )}
      </div>

      <div className="stat-cards-row">
        <StatCard icon="📊" label="Active Requests" value={totalNGO} color="blue" />
        <StatCard icon="🤝" label="Volunteers" value={volunteers} color="green" />
        <StatCard icon="₹" label="Donations Received" value={`₹${donations}`} color="purple" />
        <StatCard icon="❤" label="People Helped" value={helped} color="orange" />
      </div>

      {/* Member Applications */}
      {applications.length > 0 && (
        <div className="dash-card applications-card">
          <div className="dash-card-header">
            <h2>Member Applications</h2>
            <span className="badge-count">{applications.length} pending</span>
          </div>
          <div className="applications-list">
            {applications.map(app => (
              <div key={app._id} className="application-item">
                <img
                  src={app.userId?.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${app.userId?.name}`}
                  alt={app.userId?.name}
                  className="app-avatar"
                />
                <div className="app-info">
                  <h4>{app.userId?.name || 'Unknown User'}</h4>
                  <p>{app.userId?.email}</p>
                  {app.message && <p className="app-message">"{app.message}"</p>}
                </div>
                <div className="app-actions">
                  <button
                    className="approve-btn"
                    onClick={() => onHandleApp(user.ngoId, app._id, 'approved')}
                    disabled={processingApp === app._id}
                  >
                    {processingApp === app._id ? '...' : '✓ Approve'}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => onHandleApp(user.ngoId, app._id, 'rejected')}
                    disabled={processingApp === app._id}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dash-row-2">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Manage NGO</h2>
          </div>
          <div className="quick-actions-grid">
            <Link to={`/ngos/${user.ngoId}`} className="qa-grid-item qa-blue"><span>🏛</span><span>NGO Profile</span></Link>
            <Link to="/requests" className="qa-grid-item qa-green"><span>📋</span><span>Requests</span></Link>
            <Link to="/events" className="qa-grid-item qa-purple"><span>🎪</span><span>Events</span></Link>
            <Link to="/donations" className="qa-grid-item qa-orange"><span>💰</span><span>Donations</span></Link>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-header"><h2>Member Management</h2></div>
          <div className="quick-actions-grid">
            <Link to="/requests" className="qa-grid-item qa-blue"><span>👥</span><span>Members</span></Link>
            <Link to="/events" className="qa-grid-item qa-green"><span>➕</span><span>Invite Members</span></Link>
            <Link to="/profile" className="qa-grid-item qa-purple"><span>⚙</span><span>Settings</span></Link>
            <Link to="/chat" className="qa-grid-item qa-orange"><span>💬</span><span>Team Chat</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --------- ADMIN DASHBOARD --------- */
const AdminDashboard = ({ analytics }) => {
  const ngos = useCountUp(analytics.totalNGOs || 0);
  const users = useCountUp(analytics.totalUsers || 0);
  const reqs = useCountUp(analytics.totalRequests || 0);

  return (
    <div className="dash-sections">
      <div className="stat-cards-row">
        <StatCard icon="🏛" label="Total NGOs" value={ngos} color="blue" />
        <StatCard icon="👥" label="Total Users" value={users} color="purple" />
        <StatCard icon="📋" label="Total Requests" value={reqs} color="green" />
      </div>
    </div>
  );
};

/* --------- STAT CARD COMPONENT --------- */
const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card sc-${color}`}>
    <div className="sc-icon">{icon}</div>
    <div className="sc-value">{value}</div>
    <div className="sc-label">{label}</div>
    <div className="sc-glow" />
  </div>
);

export default Dashboard;
