import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // Layout wrapper for authenticated users
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-layout">
        <Navbar />
        <main className="content-view">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
