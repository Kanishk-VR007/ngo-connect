import React from 'react';
import './Avatar.css';

const Avatar = ({
    name,
    src,
    size = 'medium',
    variant = 'circle',
    online = false
}) => {
    // Generate initials from name
    const getInitials = (fullName) => {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    // Generate consistent color based on name
    const getColorFromName = (name) => {
        if (!name) return '#667eea';

        const colors = [
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#ec4899', // Pink
            '#f59e0b', // Amber
            '#10b981', // Green
            '#ef4444', // Red
            '#06b6d4', // Cyan
            '#f97316', // Orange
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // Use provided image or generate default avatar
    const avatarSrc = src || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=${getColorFromName(name).replace('#', '')}`;

    return (
        <div className={`avatar avatar-${size} avatar-${variant} ${online ? 'avatar-online' : ''}`}>
            {src || avatarSrc.includes('dicebear') ? (
                <img src={avatarSrc} alt={name || 'User'} className="avatar-img" />
            ) : (
                <div
                    className="avatar-initials"
                    style={{ backgroundColor: getColorFromName(name) }}
                >
                    {getInitials(name)}
                </div>
            )}
            {online && <span className="avatar-status"></span>}
        </div>
    );
};

export default Avatar;
