import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  CalendarDays, 
  Laptop, 
  FileSpreadsheet, 
  ShieldAlert, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'My Profile', path: '/profile', icon: <User size={20} />, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Employee Directory', path: '/employees', icon: <Users size={20} />, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Leave Workflow', path: '/leaves', icon: <CalendarDays size={20} />, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Asset Management', path: '/assets', icon: <Laptop size={20} />, roles: ['admin', 'hr', 'manager', 'employee'] },
    { name: 'Reports & Analytics', path: '/reports', icon: <FileSpreadsheet size={20} />, roles: ['admin', 'hr', 'manager'] },
    { name: 'System Audits', path: '/audits', icon: <ShieldAlert size={20} />, roles: ['admin'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="sidebar-container glass-panel">
      <div className="sidebar-logo">
        <h2 className="glow-text">i-SOFTZONE</h2>
        <span className="logo-sub">Enterprise Portal</span>
      </div>
      
      <nav className="sidebar-menu">
        {filteredItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
