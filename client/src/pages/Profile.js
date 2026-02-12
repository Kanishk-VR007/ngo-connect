import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.location?.city || '',
    state: user?.location?.state || ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.put('/api/auth/update-profile', {
        name: formData.name,
        phone: formData.phone,
        location: {
          city: formData.city,
          state: formData.state
        }
      });

      updateUser(response.data.data);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="grid grid-2">
          <div className="card">
            <h2>Profile Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="input-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="input-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {message && (
                <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
                  {message}
                </div>
              )}

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Account Details</h2>
            <div className="account-info">
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Account Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}</p>
              {user?.ngoId && <p><strong>NGO Member:</strong> Yes</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
