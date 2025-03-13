import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // W pełnej implementacji, zastąp to faktycznym zapytaniem API
        // const response = await axios.get('/api/client/dashboard');
        
        // Dla teraz, używamy danych testowych
        // Symulacja opóźnienia odpowiedzi serwera
        setTimeout(() => {
          setStats({
            activeOrders: 2,
            completedOrders: 5,
            totalSpent: 250.45
          });
          
          setRecentOrders([
            {
              id: '1',
              orderType: 'eloBoosting',
              currentRating: 1200,
              desiredRating: 1400,
              status: 'inProgress',
              price: { amount: 75.20, currency: 'EUR' },
              createdAt: new Date().toISOString(),
              progress: { currentRating: 1320 }
            },
            {
              id: '2',
              orderType: 'eloBoosting',
              currentRating: 900,
              desiredRating: 1100,
              status: 'completed',
              price: { amount: 55.80, currency: 'EUR' },
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Nie udało się załadować danych. Spróbuj ponownie później.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get order status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-yellow-100';
      case 'inProgress':
        return 'bg-blue-600 text-blue-100';
      case 'completed':
        return 'bg-green-600 text-green-100';
      case 'cancelled':
        return 'bg-red-600 text-red-100';
      case 'dispute':
        return 'bg-orange-600 text-orange-100';
      default:
        return 'bg-gray-600 text-gray-100';
    }
  };

  // Get order status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Oczekujące';
      case 'inProgress':
        return 'W trakcie';
      case 'completed':
        return 'Ukończone';
      case 'cancelled':
        return 'Anulowane';
      case 'dispute':
        return 'Spór';
      default:
        return 'Nieznany';
    }
  };

  // Calculate progress percentage
  const calculateProgress = (order) => {
    if (order.orderType === 'eloBoosting') {
      const start = order.currentRating;
      const target = order.desiredRating;
      const current = order.progress?.currentRating || start;
      return Math.min(100, Math.round(((current - start) / (target - start)) * 100));
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Witaj, {user?.name || 'Użytkowniku'}</h1>
          <p className="text-gray-400">Zarządzaj swoimi zamówieniami boostingu i śledź postępy</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">{stats.activeOrders}</div>
            <div className="text-gray-300 font-medium">Aktywne zamówienia</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">{stats.completedOrders}</div>
            <div className="text-gray-300 font-medium">Ukończone zamówienia</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">€{stats.totalSpent.toFixed(2)}</div>
            <div className="text-gray-300 font-medium">Całkowite wydatki</div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ostatnie zamówienia</h2>
            <Link to="/client/orders" className="text-indigo-400 hover:text-indigo-300">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-4">Nie masz jeszcze żadnych zamówień</p>
                <Link 
                  to="/calculator" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Złóż pierwsze zamówienie
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Typ</th>
                      <th className="px-4 py-3 text-left">Postęp</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Cena</th>
                      <th className="px-4 py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-300">#{order.id}</td>
                        <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3">
                          {order.orderType === 'eloBoosting' ? 'ELO Boost' : 
                           order.orderType === 'winsBoost' ? 'Wins Boost' : 
                           order.orderType === 'placementMatches' ? 'Placement' : 'Inne'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex justify-between text-sm">
                              <span>
                                {order.orderType === 'eloBoosting' && 
                                  `${order.progress?.currentRating || order.currentRating} / ${order.desiredRating}`}
                              </span>
                              <span>{calculateProgress(order)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${calculateProgress(order)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          €{order.price.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            to={`/client/orders/${order.id}`}
                            className="text-indigo-400 hover:text-indigo-300"
                          >
                            Szczegóły
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Szybkie akcje</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/calculator" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Nowe zamówienie</div>
                  <div className="text-gray-400 text-sm">Zamów boosting</div>
                </div>
              </div>
            </Link>
            
            <Link to="/client/account" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Moje konto</div>
                  <div className="text-gray-400 text-sm">Ustawienia profilu</div>
                </div>
              </div>
            </Link>
            
            <Link to="/support" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Wsparcie</div>
                  <div className="text-gray-400 text-sm">Pomoc i kontakt</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;