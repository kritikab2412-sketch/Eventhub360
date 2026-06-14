import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Bell, CheckSquare } from 'lucide-react';
import API from '../api/api';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications?limit=5');
      setNotifications(res.data.data);
      // count unread
      const unread = res.data.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <header className="navbar-container glass-panel">
      <div className="navbar-left">
        <h3>Enterprise Portal</h3>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div className="notification-bell-container">
          <button className="bell-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={22} />
            {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
          </button>

          {showDropdown && (
            <div className="notifications-dropdown glass-panel">
              <div className="dropdown-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button className="read-all-btn" onClick={handleMarkAllAsRead}>
                    <CheckSquare size={14} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
              <ul className="dropdown-list">
                {notifications.length === 0 ? (
                  <li className="dropdown-item-empty">No notifications</li>
                ) : (
                  notifications.map((n) => (
                    <li 
                      key={n.id} 
                      className={`dropdown-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                    >
                      <div className="item-title">{n.title}</div>
                      <p className="item-message">{n.message}</p>
                      <span className="item-time">{new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="user-profile-card">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
