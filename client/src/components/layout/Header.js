import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
  };

  const authLinks = (
    <div className="flex items-center">
      {user && user.role === 'client' ? (
        <>
          <Link to="/client/dashboard" className="text-gray-300 hover:text-white px-3 py-2">Dashboard</Link>
          <Link to="/client/orders" className="text-gray-300 hover:text-white px-3 py-2">Moje Zamówienia</Link>
          <Link to="/calculator" className="text-gray-300 hover:text-white px-3 py-2">Nowe Zamówienie</Link>
        </>
      ) : user && user.role === 'booster' ? (
        <>
          <Link to="/booster/dashboard" className="text-gray-300 hover:text-white px-3 py-2">Dashboard</Link>
          <Link to="/booster/orders" className="text-gray-300 hover:text-white px-3 py-2">Moje Zlecenia</Link>
          <Link to="/booster/available-orders" className="text-gray-300 hover:text-white px-3 py-2">Dostępne Zlecenia</Link>
        </>
      ) : null}
      
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg ml-4"
      >
        Wyloguj
      </button>
    </div>
  );

  const guestLinks = (
    <div className="flex items-center">
      <Link to="/calculator" className="text-gray-300 hover:text-white px-3 py-2">Kalkulator</Link>
      <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg ml-2">Rejestracja</Link>
      <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg ml-2">Logowanie</Link>
    </div>
  );

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-white">EloBoost</Link>
          <nav className="ml-8 hidden md:block">
            <Link to="/" className="text-gray-300 hover:text-white px-3 py-2">Strona Główna</Link>
            <Link to="/calculator" className="text-gray-300 hover:text-white px-3 py-2">Usługi</Link>
          </nav>
        </div>
        
        {isAuthenticated ? authLinks : guestLinks}
      </div>
    </header>
  );
};

export default Header;