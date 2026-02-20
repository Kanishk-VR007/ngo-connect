import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './MyEventRequests.css';

const MyEventRequests = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            fetchMyRequests();
        }
    }, [user]);

    const fetchMyRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/event-requests/my-requests', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRequests(response.data.data);
        } catch (err) {
            setError('Failed to load your requests');
            console.error('Fetch requests error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            pending: 'status-pending',
            accepted: 'status-accepted',
            rejected: 'status-rejected',
            completed: 'status-completed'
        };
        return classes[status] || 'status-pending';
    };

    const getUrgencyBadgeClass = (urgency) => {
        const classes = {
            low: 'urgency-low',
            medium: 'urgency-medium',
            high: 'urgency-high'
        };
        return classes[urgency] || 'urgency-medium';
    };

    if (!user) {
        return (
            <div className="my-requests-page">
                <div className="auth-required">
                    <h2>Authentication Required</h2>
                    <p>Please login to view your event requests</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-requests-page">
            <div className="my-requests-header">
                <div className="header-content">
                    <h1>My Event Requests</h1>
                    <p>Track the status of your event requests</p>
                </div>
                <button onClick={() => navigate('/request-event')} className="btn btn-primary">
                    + New Request
                </button>
            </div>

            <div className="my-requests-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Loading your requests...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={fetchMyRequests} className="btn btn-primary">Try Again</button>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📝</span>
                        <h3>No Event Requests Yet</h3>
                        <p>You haven't requested any events. Start by requesting an event for your community!</p>
                        <button onClick={() => navigate('/request-event')} className="btn btn-primary">
                            Request an Event
                        </button>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div key={request._id} className="request-card">
                                <div className="request-card-header">
                                    <div className="header-left">
                                        <h3>{request.eventType}</h3>
                                        <div className="badges">
                                            <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                                                {request.status}
                                            </span>
                                            <span className={`urgency-badge ${getUrgencyBadgeClass(request.urgency)}`}>
                                                {request.urgency} urgency
                                            </span>
                                        </div>
                                    </div>
                                    <div className="header-right">
                                        <span className="request-date">
                                            Requested: {formatDate(request.createdAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="request-card-body">
                                    <p className="request-description">{request.description}</p>

                                    <div className="request-details">
                                        <div className="detail-item">
                                            <span className="detail-label">📍 Location:</span>
                                            <span>{request.location.city}, {request.location.state}</span>
                                        </div>

                                        <div className="detail-item">
                                            <span className="detail-label">📅 Preferred Date:</span>
                                            <span>{formatDate(request.preferredDate)}</span>
                                        </div>

                                        {request.expectedAttendees && (
                                            <div className="detail-item">
                                                <span className="detail-label">👥 Expected Attendees:</span>
                                                <span>{request.expectedAttendees}</span>
                                            </div>
                                        )}

                                        {request.targetNGO && (
                                            <div className="detail-item">
                                                <span className="detail-label">🏢 Target NGO:</span>
                                                <span>{request.targetNGO.name}</span>
                                            </div>
                                        )}

                                        {request.assignedTo && (
                                            <div className="detail-item">
                                                <span className="detail-label">✅ Assigned To:</span>
                                                <span className="ngo-name">{request.assignedTo.name}</span>
                                            </div>
                                        )}

                                        {request.createdEvent && (
                                            <div className="detail-item">
                                                <span className="detail-label">🎉 Event Created:</span>
                                                <button
                                                    onClick={() => navigate(`/events/${request.createdEvent._id}`)}
                                                    className="btn-link"
                                                >
                                                    {request.createdEvent.title}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {request.responseMessage && (
                                        <div className="response-message">
                                            <strong>Response from NGO:</strong>
                                            <p>{request.responseMessage}</p>
                                            {request.respondedAt && (
                                                <span className="response-date">
                                                    Responded on {formatDate(request.respondedAt)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEventRequests;
