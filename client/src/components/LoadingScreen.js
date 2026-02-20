import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ message = 'Loading...' }) => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                {/* Animated NGO Connect Logo */}
                <div className="loading-logo">
                    <div className="logo-ring ring-1"></div>
                    <div className="logo-ring ring-2"></div>
                    <div className="logo-ring ring-3"></div>
                    <div className="logo-icon">🤝</div>
                </div>

                {/* Brand name */}
                <h2 className="loading-brand">NGO Connect</h2>

                {/* Animated dots bar */}
                <div className="loading-bar">
                    <div className="loading-bar-fill"></div>
                </div>

                {/* Status message */}
                <p className="loading-message">{message}</p>

                {/* Floating particles */}
                <div className="particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`particle particle-${i + 1}`}></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
