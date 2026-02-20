import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './EventsList.css';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        eventType: '',
        city: '',
        state: '',
        status: 'upcoming'
    });

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (filters.eventType) queryParams.append('eventType', filters.eventType);
            if (filters.city) queryParams.append('city', filters.city);
            if (filters.state) queryParams.append('state', filters.state);
            if (filters.status) queryParams.append('status', filters.status);

            const response = await axios.get(`/api/events?${queryParams.toString()}`);
            setEvents(response.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load events');
            console.error('Fetch events error:', err);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventTypeIcon = (type) => {
        const icons = {
            'Health Camp': '🏥',
            'Education Workshop': '📚',
            'Food Distribution': '🍽️',
            'Blood Donation': '🩸',
            'Skill Development': '🛠️',
            'Environmental Cleanup': '🌱',
            'Awareness Campaign': '📢',
            'Fundraising': '💰',
            'Community Service': '🤝',
            'Other': '📌'
        };
        return icons[type] || '📌';
    };

    return (
        <div className="events-page">
            <div className="events-header">
                <div className="events-header-content">
                    <h1>Upcoming Events</h1>
                    <p>Find and join NGO events in your community</p>
                </div>
                <Link to="/request-event" className="btn btn-primary">
                    Request an Event
                </Link>
            </div>

            {/* Filters */}
            <div className="events-filters">
                <div className="filter-group">
                    <label>Event Type</label>
                    <select name="eventType" value={filters.eventType} onChange={handleFilterChange}>
                        <option value="">All Types</option>
                        <option value="Health Camp">Health Camp</option>
                        <option value="Education Workshop">Education Workshop</option>
                        <option value="Food Distribution">Food Distribution</option>
                        <option value="Blood Donation">Blood Donation</option>
                        <option value="Skill Development">Skill Development</option>
                        <option value="Environmental Cleanup">Environmental Cleanup</option>
                        <option value="Awareness Campaign">Awareness Campaign</option>
                        <option value="Fundraising">Fundraising</option>
                        <option value="Community Service">Community Service</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>City</label>
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={handleFilterChange}
                        placeholder="Enter city"
                    />
                </div>

                <div className="filter-group">
                    <label>State</label>
                    <input
                        type="text"
                        name="state"
                        value={filters.state}
                        onChange={handleFilterChange}
                        placeholder="Enter state"
                    />
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Events List */}
            <div className="events-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner-large"></div>
                        <p>Loading events...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={fetchEvents} className="btn btn-primary">Try Again</button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📅</span>
                        <h3>No events found</h3>
                        <p>Try adjusting your filters or check back later for new events</p>
                        <Link to="/request-event" className="btn btn-primary">
                            Request an Event
                        </Link>
                    </div>
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <div key={event._id} className="event-card">
                                <div className="event-card-header">
                                    <span className="event-type-badge">
                                        {getEventTypeIcon(event.eventType)} {event.eventType}
                                    </span>
                                    <span className={`event-status event-status-${event.status}`}>
                                        {event.status}
                                    </span>
                                </div>

                                <div className="event-card-body">
                                    <h3>{event.title}</h3>
                                    <p className="event-description">{event.description}</p>

                                    <div className="event-details">
                                        <div className="event-detail">
                                            <span className="detail-icon">🏢</span>
                                            <span>{event.hostNGO?.name || 'Unknown NGO'}</span>
                                        </div>

                                        <div className="event-detail">
                                            <span className="detail-icon">📍</span>
                                            <span>{event.location.city}, {event.location.state}</span>
                                        </div>

                                        <div className="event-detail">
                                            <span className="detail-icon">📅</span>
                                            <span>{formatDate(event.startDate)}</span>
                                        </div>

                                        {event.capacity && (
                                            <div className="event-detail">
                                                <span className="detail-icon">👥</span>
                                                <span>{event.registeredAttendees?.length || 0} / {event.capacity}</span>
                                            </div>
                                        )}

                                        {event.collaboratingNGOs?.length > 0 && (
                                            <div className="event-detail">
                                                <span className="detail-icon">🤝</span>
                                                <span>{event.collaboratingNGOs.length} Collaborating NGOs</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="event-card-footer">
                                    <Link to={`/events/${event._id}`} className="btn btn-secondary">
                                        View Details
                                    </Link>
                                    <button className="btn btn-primary">
                                        Register
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsList;
