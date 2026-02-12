import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          NGO Connect
        </Link>
        
        <div className="navbar-menu">
          <Link to="/ngos" className="navbar-link">Find NGOs</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">Dashboard</Link>
              <Link to="/requests" className="navbar-link">Requests</Link>
              <Link to="/donations" className="navbar-link">Donations</Link>
              <Link to="/chat" className="navbar-link">Chat</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-success">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
