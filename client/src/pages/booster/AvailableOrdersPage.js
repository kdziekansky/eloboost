import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AvailableOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    orderType: 'all',
    minElo: '',
    maxElo: ''
  });
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      
      // W pełnej implementacji, zastąp to faktycznym zapytaniem API
      // const response = await axios.get('/api/boosters/available-orders');
      
      // Dla teraz, używamy danych testowych
      setTimeout(() => {
        const testOrders = [
          {
            id: '1',
            orderType: 'eloBoosting',
            currentRating: 1200,
            desiredRating: 1500,
            status: 'pending',
            price: { amount: 95.40, currency: 'EUR' },
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            options: {
              lobbyDuo: false,
              soloOnly: true,
              steamOfflineMode: true,
              premiumQueue: false,
              priority: false,
              superExpress: false,
              liveStream: false
            },
            estimatedEarnings: 66.78
          },
          {
            id: '2',
            orderType: 'winsBoost',
            winsRequired: 10,
            status: 'pending',
            price: { amount: 80.20, currency: 'EUR' },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            options: {
              lobbyDuo: true,
              soloOnly: false,
              steamOfflineMode: false,
              premiumQueue: true,
              priority: true,
              superExpress: false,
              liveStream: false
            },
            estimatedEarnings: 56.14
          },
          {
            id: '3',
            orderType: 'eloBoosting',
            currentRating: 900,
            desiredRating: 1200,
            status: 'pending',
            price: { amount: 75.90, currency: 'EUR' },
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            options: {
              lobbyDuo: false,
              soloOnly: false,
              steamOfflineMode: true,
              premiumQueue: false,
              priority: false,
              superExpress: true,
              liveStream: true
            },
            estimatedEarnings: 53.13
          },
          {
            id: '4',
            orderType: 'placementMatches',
            placementMatches: 10,
            status: 'pending',
            price: { amount: 65.50, currency: 'EUR' },
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            options: {
              lobbyDuo: false,
              soloOnly: false,
              steamOfflineMode: true,
              premiumQueue: false,
              priority: false,
              superExpress: false,
              liveStream: false
            },
            estimatedEarnings: 45.85
          }
        ];
        
        setOrders(testOrders);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Nie udało się załadować dostępnych zamówień.');
      console.error('Error fetching available orders:', err);
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      setAcceptingOrderId(orderId);
      
      // W pełnej implementacji, zastąp to faktycznym zapytaniem API
      // await axios.post(`/api/boosters/accept-order/${orderId}`);
      
      // Dla teraz, po prostu usuń zamówienie z listy po opóźnieniu
      setTimeout(() => {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        setAcceptingOrderId(null);
      }, 1000);
    } catch (err) {
      setError('Nie udało się przyjąć zamówienia.');
      console.error('Error accepting order:', err);
      setAcceptingOrderId(null);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = (ordersList) => {
    return ordersList.filter(order => {
      // Filter by order type
      if (filters.orderType !== 'all' && order.orderType !== filters.orderType) {
        return false;
      }
      
      // Filter by ELO range (only for eloBoosting type)
      if (order.orderType === 'eloBoosting') {
        if (filters.minElo && order.currentRating < parseInt(filters.minElo)) {
          return false;
        }
        if (filters.maxElo && order.desiredRating > parseInt(filters.maxElo)) {
          return false;
        }
      }
      
      return true;
    });
  };

  const filteredOrders = applyFilters(orders);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format order details
  const formatOrderDetails = (order) => {
    if (order.orderType === 'eloBoosting') {
      return `${order.currentRating} → ${order.desiredRating} ELO`;
    } else if (order.orderType === 'winsBoost') {
      return `${order.winsRequired} zwycięstw`;
    } else if (order.orderType === 'placementMatches') {
      return `${order.placementMatches} meczy`;
    }
    return '-';
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Dostępne zamówienia</h1>
        
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium mb-4">Filtry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Typ zamówienia</label>
              <select
                name="orderType"
                value={filters.orderType}
                onChange={handleFilterChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
              >
                <option value="all">Wszystkie</option>
                <option value="eloBoosting">ELO Boost</option>
                <option value="winsBoost">Wins Boost</option>
                <option value="placementMatches">Placement Matches</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min. ELO</label>
              <input
                type="number"
                name="minElo"
                value={filters.minElo}
                onChange={handleFilterChange}
                placeholder="Min ELO"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max. ELO</label>
              <input
                type="number"
                name="maxElo"
                value={filters.maxElo}
                onChange={handleFilterChange}
                placeholder="Max ELO"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
              />
            </div>
          </div>
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
        ) : filteredOrders.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">Brak dostępnych zamówień spełniających wybrane kryteria</div>
            <button 
              onClick={fetchAvailableOrders}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-200"
            >
              Odśwież
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-900/10 hover:border-indigo-600/30 border border-gray-700 transition duration-200">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">#{order.id.substring(0, 8)}</span>
                    <span className="text-sm text-gray-400">{formatDate(order.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {order.orderType === 'eloBoosting' ? 'ELO Boost' : 
                     order.orderType === 'winsBoost' ? 'Wins Boost' : 
                     order.orderType === 'placementMatches' ? 'Placement Matches' : 'Inne'}
                  </h3>
                  <p className="text-indigo-400 font-medium mt-1">{formatOrderDetails(order)}</p>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Szacowany zarobek</div>
                    <div className="text-green-400 font-medium">€{order.estimatedEarnings.toFixed(2)}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Opcje</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {order.options.lobbyDuo && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Lobby/Duo</span>
                      )}
                      {order.options.soloOnly && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Solo Only</span>
                      )}
                      {order.options.steamOfflineMode && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Offline Mode</span>
                      )}
                      {order.options.premiumQueue && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Premium</span>
                      )}
                      {order.options.priority && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Priority</span>
                      )}
                      {order.options.superExpress && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Super Express</span>
                      )}
                      {order.options.liveStream && (
                        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-2 py-1 rounded-full">Live Stream</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={acceptingOrderId === order.id}
                    className={`w-full py-2 px-4 rounded-lg font-medium ${
                      acceptingOrderId === order.id
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {acceptingOrderId === order.id ? 'Akceptowanie...' : 'Akceptuj zamówienie'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableOrdersPage;