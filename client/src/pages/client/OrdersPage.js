// client/src/pages/client/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import Pagination from '../../components/ui/Pagination';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // W pełnej implementacji, zastąp to faktycznym zapytaniem API
        // const response = await axios.get(`/api/orders?page=${page}&limit=${limit}&status=${filter}`);
        
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
            },
            {
              id: '3',
              orderType: 'winsBoost',
              winsRequired: 10,
              status: 'pending',
              price: { amount: 65.40, currency: 'EUR' },
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              progress: { winsCompleted: 0 }
            }
          ];
          
          const filteredOrders = filter === 'all' 
            ? testOrders 
            : testOrders.filter(order => order.status === filter);
          
          setOrders(filteredOrders);
          setTotalPages(1); // Tylko 1 strona dla danych testowych
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError('Nie udało się załadować zamówień. Spróbuj ponownie później.');
        console.error('Error fetching orders:', err);
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [page, limit, filter]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format rating change
  const formatRatingChange = (order) => {
    if (order.orderType === 'eloBoosting') {
      const currentProgress = order.progress?.currentRating || order.currentRating;
      const targetRating = order.desiredRating;
      return `${currentProgress} → ${targetRating}`;
    } else if (order.orderType === 'winsBoost') {
      const completed = order.progress?.winsCompleted || 0;
      const total = order.winsRequired;
      return `${completed}/${total} zwycięstw`;
    } else if (order.orderType === 'placementMatches') {
      const completed = order.progress?.matchesCompleted || 0;
      const total = order.placementMatches;
      return `${completed}/${total} meczy`;
    }
    return '-';
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

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Twoje zamówienia</h1>
          <Link 
            to="/calculator" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Zamów nowy boost
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
            className={`px-4 py-2 rounded-lg transition duration-200 ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setFilter('pending')}
          >
            Oczekujące
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
            <div className="text-gray-400 mb-4">Nie masz jeszcze żadnych zamówień</div>
            <Link 
              to="/calculator" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg transition duration-200"
            >
              Zamów pierwszy boost
            </Link>
          </div>
        ) : (
          <>
            {/* Orders list */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Data</th>
                      <th className="px-4 py-3 text-left">Usługa</th>
                      <th className="px-4 py-3 text-left">Postęp</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Cena</th>
                      <th className="px-4 py-3 text-left">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {orders.map((order) => (
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
                            <span className="text-sm">{formatRatingChange(order)}</span>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${calculateProgress(order)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{calculateProgress(order)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">€{order.price.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            to={`/client/orders/${order.id}`}
                            className="text-indigo-400 hover:text-indigo-300 underline"
                          >
                            Szczegóły
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination 
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;