import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Sprawdź uprawnienia, jeśli podano role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Przekieruj do odpowiedniego dashboardu
    if (user.role === 'client') {
      return <Navigate to="/client/dashboard" />;
    } else if (user.role === 'booster') {
      return <Navigate to="/booster/dashboard" />;
    }
    
    // Domyślne przekierowanie
    return <Navigate to="/" />;
  }

  return element;
};

export default PrivateRoute;