import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';

const ActiveOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // W pełnej implementacji, zastąp to faktycznym zapytaniem API
      // const response = await axios.get(`/api/orders?status=${filter}`);
      
      // Dla teraz, używamy danych testowych
      setTimeout(() => {
        const testOrders = [
          {
            id: '1',
            orderType: 'eloBoosting',
            currentRating: 1200,
            desiredRating: 1400,
            status: 'inProgress',
            price: { amount: 75.20, currency: 'EUR' },
            createdAt: new Date().toISOString(),
            progress: { currentRating: 1320 },
            estimatedEarnings: 52.64
          },
          {
            id: '2',
            orderType: 'winsBoost',
            winsRequired: 10,
            status: 'inProgress',
            price: { amount: 80.50, currency: 'EUR' },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            progress: { winsCompleted: 6 },
            estimatedEarnings: 56.35
          },
          {
            id: '3',
            orderType: 'eloBoosting',
            currentRating: 900,
            desiredRating: 1100,
            status: 'completed',
            price: { amount: 55.80, currency: 'EUR' },
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            progress: { currentRating: 1100 },
            estimatedEarnings: 39.06
          }
        ];
        
        const filteredOrders = filter === 'all' 
          ? testOrders 
          : testOrders.filter(order => order.status === filter);
        
        setOrders(filteredOrders);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Nie udało się załadować zamówień. Spróbuj ponownie później.');
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Format order details
  const formatOrderDetails = (order) => {
    if (order.orderType === 'eloBoosting') {
      const currentProgress = order.progress?.currentRating || order.currentRating;
      return `${currentProgress} / ${order.desiredRating} ELO`;
    } else if (order.orderType === 'winsBoost') {
      const completed = order.progress?.winsCompleted || 0;
      return `${completed} / ${order.winsRequired} zwycięstw`;
    } else if (order.orderType === 'placementMatches') {
      const completed = order.progress?.matchesCompleted || 0;
      return `${completed} / ${order.placementMatches} meczy`;
    }
    return '-';
  };

  // Get order type label
  const getOrderTypeLabel = (type) => {
    switch (type) {
      case 'eloBoosting':
        return 'ELO Boost';
      case 'winsBoost':
        return 'Wins Boost';
      case 'placementMatches':
        return 'Placement Matches';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Twoje zlecenia</h1>
          <Link 
            to="/booster/available-orders" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Znajdź nowe zlecenia
          </Link>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-lg transition duration-200 ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setFilter('all')}
          >
            Wszystkie
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition duration-200 ${filter === 'inProgress' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setFilter('inProgress')}
          >
            W trakcie
          </button>
          <button 
            className={`px-4 py-2 rounded-lg transition duration-200 ${filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setFilter('completed')}
          >
            Ukończone
          </button>
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">Nie masz jeszcze żadnych zleceń</div>
            <Link 
              to="/booster/available-orders" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-200"
            >
              Znajdź swoje pierwsze zlecenie
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-750 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">
                      {getOrderTypeLabel(order.orderType)} #{order.id.substring(0, 8)}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                {/* Order Body */}
                <div className="p-5">
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Usługa</div>
                      <div className="font-medium">
                        {order.orderType === 'eloBoosting' ? 
                          `${order.currentRating} → ${order.desiredRating} ELO` : 
                          order.orderType === 'winsBoost' ? 
                          `${order.winsRequired} zwycięstw` : 
                          `${order.placementMatches} meczy`}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Zarobek</div>
                      <div className="font-medium text-green-400">
                        €{order.estimatedEarnings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Postęp: {formatOrderDetails(order)}</span>
                      <span>{calculateProgress(order)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full"
                        style={{ width: `${calculateProgress(order)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap mt-4 gap-3">
                    {order.status === 'inProgress' && (
                      <Link 
                        to={`/booster/orders/${order.id}/update`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Aktualizuj postęp
                      </Link>
                    )}
                    <Link 
                      to={`/booster/orders/${order.id}`}
                      className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-200 text-sm flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Szczegóły
                    </Link>
                  </div>
                </div>
                
                {/* Order Options Indicators */}
                {(order.lobbyDuo || order.soloOnly || order.steamOfflineMode || 
                  order.premiumQueue || order.priority || order.superExpress || 
                  order.liveStream) && (
                  <div className="bg-gray-750 p-3 flex flex-wrap gap-2">
                    {order.lobbyDuo && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Lobby/Duo
                      </span>
                    )}
                    {order.soloOnly && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Solo Only
                      </span>
                    )}
                    {order.steamOfflineMode && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Offline Mode
                      </span>
                    )}
                    {order.premiumQueue && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                    {order.priority && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Priority
                      </span>
                    )}
                    {order.superExpress && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Super Express
                      </span>
                    )}
                    {order.liveStream && (
                      <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded-full">
                        Live Stream
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Stats Summary (For Desktop) */}
        {!loading && orders.length > 0 && (
          <div className="mt-10 bg-gray-800 rounded-lg p-6 hidden md:block">
            <h2 className="text-xl font-bold mb-4">Podsumowanie</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-gray-400 mb-1">Aktywne zlecenia</div>
                <div className="text-2xl font-bold text-indigo-400">
                  {orders.filter(order => order.status === 'inProgress').length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Ukończone zlecenia</div>
                <div className="text-2xl font-bold text-green-400">
                  {orders.filter(order => order.status === 'completed').length}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Szacowane zarobki</div>
                <div className="text-2xl font-bold text-yellow-400">
                  €{orders.reduce((sum, order) => sum + order.estimatedEarnings, 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveOrdersPage;