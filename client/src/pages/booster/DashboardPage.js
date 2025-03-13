import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    activeOrders: 0,
    completedOrders: 0,
    totalEarnings: 0,
    currentRating: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // W pełnej implementacji, zastąp to faktycznym zapytaniem API
        // const response = await axios.get('/api/booster/dashboard');
        
        // Dla teraz, używamy danych testowych
        setTimeout(() => {
          setStats({
            activeOrders: 3,
            completedOrders: 12,
            totalEarnings: 780.50,
            currentRating: 9.7
          });
          
          setRecentJobs([
            {
              id: '1',
              orderType: 'eloBoosting',
              currentRating: 1200,
              desiredRating: 1500,
              status: 'inProgress',
              price: { amount: 95.40, currency: 'EUR' },
              createdAt: new Date().toISOString(),
              progress: { currentRating: 1350 },
              estimatedEarnings: 66.78
            },
            {
              id: '2',
              orderType: 'winsBoost',
              winsRequired: 8,
              status: 'inProgress',
              price: { amount: 60.20, currency: 'EUR' },
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              progress: { winsCompleted: 3 },
              estimatedEarnings: 42.14
            },
            {
              id: '3',
              orderType: 'eloBoosting',
              currentRating: 900,
              desiredRating: 1200,
              status: 'completed',
              price: { amount: 75.90, currency: 'EUR' },
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              progress: { currentRating: 1200 },
              estimatedEarnings: 53.13
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

  // Format order details
  const formatOrderDetails = (order) => {
    if (order.orderType === 'eloBoosting') {
      const current = order.progress?.currentRating || order.currentRating;
      return `${current} / ${order.desiredRating} ELO`;
    } else if (order.orderType === 'winsBoost') {
      const completed = order.progress?.winsCompleted || 0;
      return `${completed} / ${order.winsRequired} wins`;
    } else if (order.orderType === 'placementMatches') {
      const completed = order.progress?.matchesCompleted || 0;
      return `${completed} / ${order.placementMatches} matches`;
    }
    return '';
  };

  // Calculate progress percentage
  const calculateProgress = (order) => {
    if (order.orderType === 'eloBoosting') {
      const start = order.currentRating;
      const target = order.desiredRating;
      const current = order.progress?.currentRating || start;
      return Math.min(100, Math.round(((current - start) / (target - start)) * 100));
    } else if (order.orderType === 'winsBoost') {
      const completed = order.progress?.winsCompleted || 0;
      const total = order.winsRequired;
      return Math.min(100, Math.round((completed / total) * 100));
    } else if (order.orderType === 'placementMatches') {
      const completed = order.progress?.matchesCompleted || 0;
      const total = order.placementMatches;
      return Math.min(100, Math.round((completed / total) * 100));
    }
    return 0;
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
        return 'Nieznane';
    }
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Witaj, {user?.name || 'Boosterze'}</h1>
          <p className="text-gray-400">Zarządzaj swoimi zleceniami boostingu i śledź swoje zarobki</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">{stats.activeOrders}</div>
            <div className="text-gray-300 font-medium">Aktywne zlecenia</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">{stats.completedOrders}</div>
            <div className="text-gray-300 font-medium">Ukończone zlecenia</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">€{stats.totalEarnings.toFixed(2)}</div>
            <div className="text-gray-300 font-medium">Całkowite zarobki</div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-indigo-400 text-2xl mb-2">{stats.currentRating.toFixed(1)}/10</div>
            <div className="text-gray-300 font-medium">Ocena</div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ostatnie zlecenia</h2>
            <Link to="/booster/orders" className="text-indigo-400 hover:text-indigo-300">
              Zobacz wszystkie
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {recentJobs.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-4">Nie masz jeszcze żadnych zleceń</p>
                <Link 
                  to="/booster/available-orders" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200"
                >
                  Znajdź pierwsze zlecenie
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
                      <th className="px-4 py-3 text-left">Zarobek</th>
                      <th className="px-4 py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-300">#{job.id}</td>
                        <td className="px-4 py-3">{formatDate(job.createdAt)}</td>
                        <td className="px-4 py-3">
                          {job.orderType === 'eloBoosting' ? 'ELO Boost' : 
                           job.orderType === 'winsBoost' ? 'Wins Boost' : 
                           job.orderType === 'placementMatches' ? 'Placement' : 'Inne'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <div className="flex justify-between text-sm">
                              <span>{formatOrderDetails(job)}</span>
                              <span>{calculateProgress(job)}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${calculateProgress(job)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-green-400">
                          €{job.estimatedEarnings.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            to={`/booster/orders/${job.id}`}
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
            <Link to="/booster/available-orders" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Dostępne zlecenia</div>
                  <div className="text-gray-400 text-sm">Znajdź nową pracę</div>
                </div>
              </div>
            </Link>
            
            <Link to="/booster/profile" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Mój profil</div>
                  <div className="text-gray-400 text-sm">Ustawienia i dostępność</div>
                </div>
              </div>
            </Link>
            
            <Link to="/booster/earnings" className="bg-gray-800 hover:bg-gray-750 p-4 rounded-lg transition duration-200 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mr-3 group-hover:bg-indigo-600/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Moje zarobki</div>
                  <div className="text-gray-400 text-sm">Historia i wypłaty</div>
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