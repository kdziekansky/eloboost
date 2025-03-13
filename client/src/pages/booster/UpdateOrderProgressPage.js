import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import MessageChat from '../../components/chat/MessageChat';

const UpdateOrderProgressPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  
  // Stany dla formularza aktualizacji
  const [formData, setFormData] = useState({
    current_progress_rating: '',
    current_progress_wins: '',
    current_progress_matches: '',
    status: '',
    note: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Pobierz dane zamówienia
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pobierz dane zamówienia
      const orderResponse = await axios.get(`/api/orders/${id}`);
      const orderData = orderResponse.data.data;
      setOrder(orderData);
      
      // Zainicjalizuj formData na podstawie order
      setFormData({
        current_progress_rating: orderData.current_progress_rating || orderData.current_rating || '',
        current_progress_wins: orderData.current_progress_wins || 0,
        current_progress_matches: orderData.current_progress_matches || 0,
        status: orderData.status,
        note: ''
      });
      
      // Pobierz dane klienta (byłaby to funkcja API)
      // W pełnej implementacji, pobieralibyśmy te dane z API
      setClient({
        id: orderData.client_id,
        name: 'Klient #' + orderData.client_id.substring(0, 4),
        orders: 5,
        joinedAt: '2024-01-15'
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się pobrać danych zamówienia');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);
  
  // Obsługa zmian w formularzu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Oblicz procent ukończenia
  const calculateProgress = () => {
    if (!order) return 0;
    
    if (order.order_type === 'eloBoosting') {
      const startRating = order.current_rating;
      const targetRating = order.desired_rating;
      const currentRating = formData.current_progress_rating || startRating;
      
      return Math.min(100, Math.round(((currentRating - startRating) / (targetRating - startRating)) * 100));
    } else if (order.order_type === 'winsBoost') {
      const completed = formData.current_progress_wins || 0;
      const total = order.wins_required;
      
      return Math.min(100, Math.round((completed / total) * 100));
    } else if (order.order_type === 'placementMatches') {
      const completed = formData.current_progress_matches || 0;
      const total = order.placement_matches;
      
      return Math.min(100, Math.round((completed / total) * 100));
    }
    
    return 0;
  };
  
  // Sprawdź czy zamówienie może zostać oznaczone jako zakończone
  const canComplete = () => {
    if (!order) return false;
    
    if (order.status !== 'inProgress') return false;
    
    const progress = calculateProgress();
    return progress >= 100;
  };
  
  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setUpdateSuccess(false);
      
      // Przygotuj dane do aktualizacji
      const updateData = {
        note: formData.note
      };
      
      // Dodaj dane postępu w zależności od typu zamówienia
      if (order.order_type === 'eloBoosting') {
        updateData.current_progress_rating = parseInt(formData.current_progress_rating);
      } else if (order.order_type === 'winsBoost') {
        updateData.current_progress_wins = parseInt(formData.current_progress_wins);
      } else if (order.order_type === 'placementMatches') {
        updateData.current_progress_matches = parseInt(formData.current_progress_matches);
      }
      
      // Aktualizacja statusu (tylko jeśli się zmienił)
      if (formData.status !== order.status) {
        updateData.status = formData.status;
      }
      
      // Wyślij żądanie aktualizacji
      const response = await axios.put(`/api/orders/${id}`, updateData);
      
      // Aktualizuj dane zamówienia
      setOrder(response.data.data);
      setUpdateSuccess(true);
      
      // Resetuj notatkę
      setFormData({
        ...formData,
        note: ''
      });
      
      // Przekieruj po zakończeniu zamówienia
      if (updateData.status === 'completed') {
        setTimeout(() => {
          navigate('/booster/orders');
        }, 2000);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się zaktualizować zamówienia');
      console.error('Error updating order:', err);
    } finally {
      setUpdating(false);
    }
  };
  
  // Format daty
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Określ typ zamówienia po polsku
  const getOrderTypeLabel = () => {
    if (!order) return '';
    
    switch (order.order_type) {
      case 'eloBoosting':
        return 'ELO Boost';
      case 'winsBoost':
        return 'Wins Boost';
      case 'placementMatches':
        return 'Mecze kwalifikacyjne';
      default:
        return order.order_type;
    }
  };
  
  // Szczegóły zamówienia w zależności od typu
  const getOrderDetails = () => {
    if (!order) return '';
    
    switch (order.order_type) {
      case 'eloBoosting':
        return `${order.current_rating} → ${order.desired_rating} ELO`;
      case 'winsBoost':
        return `${order.wins_required} zwycięstw`;
      case 'placementMatches':
        return `${order.placement_matches} meczy kwalifikacyjnych`;
      default:
        return '';
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
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-400">
            <Link to="/booster/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/booster/orders" className="hover:text-gray-300">Zlecenia</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Aktualizacja postępu</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {updateSuccess && (
          <div className="bg-green-900/20 border border-green-900 text-green-200 p-4 rounded-lg mb-6">
            Zamówienie zostało pomyślnie zaktualizowane.
          </div>
        )}
        
        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold mb-1">
                      {getOrderTypeLabel()} #{order.id.substring(0, 8)}
                    </h1>
                    <div className="text-gray-400">
                      Utworzone {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                
                {/* Order details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 mb-1">Usługa</div>
                    <div className="font-medium">{getOrderDetails()}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Cena</div>
                    <div className="font-medium text-green-400">
                      €{order.price_amount.toFixed(2)} {order.price_currency}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Update Progress Form */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Aktualizacja postępu</h2>
                
                <form onSubmit={handleSubmit}>
                  {/* Progress fields specific to order type */}
                  {order.order_type === 'eloBoosting' && (
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2" htmlFor="current_progress_rating">
                        Aktualny rating ELO
                      </label>
                      <input
                        type="number"
                        id="current_progress_rating"
                        name="current_progress_rating"
                        value={formData.current_progress_rating}
                        onChange={handleChange}
                        min={order.current_rating}
                        max={order.desired_rating}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Postęp</span>
                          <span>{calculateProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {formData.current_progress_rating} / {order.desired_rating} ELO
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {order.order_type === 'winsBoost' && (
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2" htmlFor="current_progress_wins">
                        Liczba wygranych meczy
                      </label>
                      <input
                        type="number"
                        id="current_progress_wins"
                        name="current_progress_wins"
                        value={formData.current_progress_wins}
                        onChange={handleChange}
                        min={0}
                        max={order.wins_required}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Postęp</span>
                          <span>{calculateProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {formData.current_progress_wins} / {order.wins_required} zwycięstw
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {order.order_type === 'placementMatches' && (
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2" htmlFor="current_progress_matches">
                        Liczba rozegranych meczy
                      </label>
                      <input
                        type="number"
                        id="current_progress_matches"
                        name="current_progress_matches"
                        value={formData.current_progress_matches}
                        onChange={handleChange}
                        min={0}
                        max={order.placement_matches}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Postęp</span>
                          <span>{calculateProgress()}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full"
                            style={{ width: `${calculateProgress()}%` }}
                          ></div>
                        </div>
                        <div className="text-gray-400 text-sm mt-1">
                          {formData.current_progress_matches} / {order.placement_matches} meczy
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Status update */}
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Status zamówienia</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="inProgress">W trakcie</option>
                      {canComplete() && (
                        <option value="completed">Ukończone</option>
                      )}
                    </select>
                  </div>
                  
                  {/* Note */}
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2" htmlFor="note">
                      Notatka (opcjonalnie)
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Dodaj notatkę o postępie..."
                    ></textarea>
                  </div>
                  
                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={updating}
                    className={`px-4 py-2 rounded-lg ${
                      updating
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {updating ? 'Aktualizowanie...' : 'Aktualizuj postęp'}
                  </button>
                </form>
              </div>
              
              {/* Account Details */}
              {order.account_login && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Dane konta</h2>
                    <button
                      onClick={() => setShowAccountDetails(!showAccountDetails)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {showAccountDetails ? 'Ukryj' : 'Pokaż'}
                    </button>
                  </div>
                  
                  {showAccountDetails ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 mb-1">Login</div>
                        <div className="font-medium">{order.account_login}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Hasło</div>
                        <div className="font-medium">{order.account_password}</div>
                      </div>
                      
                      {order.steam_offline_mode && (
                        <div className="md:col-span-2">
                          <div className="flex items-center text-yellow-400 mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>Klient wymaga gry w trybie offline Steam</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      Dane konta są ukryte ze względów bezpieczeństwa.
                    </div>
                  )}
                </div>
              )}
              
              {/* Message Chat */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <MessageChat orderId={id} />
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Klient</h2>
                
                {client ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl font-bold">{client.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-400">
                          Zamówień: {client.orders}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      Z nami od {formatDate(client.joinedAt)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    Informacje o kliencie są niedostępne.
                  </div>
                )}
              </div>
              
              {/* Order Options */}
              {order.lobby_duo || order.solo_only || order.steam_offline_mode || 
               order.premium_queue || order.priority || order.super_express || 
               order.live_stream ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-bold mb-4">Opcje zamówienia</h2>
                  
                  <div className="space-y-2">
                    {order.lobby_duo && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>Lobby/Duo</span>
                      </div>
                    )}
                    
                    {order.solo_only && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Solo Only</span>
                      </div>
                    )}
                    
                    {order.steam_offline_mode && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                        <span>Steam Offline Mode</span>
                      </div>
                    )}
                    
                    {order.premium_queue && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                        <span>Premium Queue</span>
                      </div>
                    )}
                    
                    {order.priority && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                        <span>Priority</span>
                      </div>
                    )}
                    
                    {order.super_express && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span>Super Express</span>
                      </div>
                    )}
                    
                    {order.live_stream && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        <span>Live Stream</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
              
              {/* Estimated Earnings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Twój zarobek</h2>
                
                <div className="text-2xl font-bold text-green-400">
                  €{(order.price_amount * 0.7).toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  Szacowany zarobek (70% wartości zamówienia)
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-gray-400 mb-2">Wypłata nastąpi po:</div>
                  <ul className="list-disc list-inside text-gray-300">
                    <li>Zakończeniu zamówienia</li>
                    <li>Potwierdzeniu przez klienta</li>
                    <li>14-dniowym okresie gwarancji</li>
                  </ul>
                </div>
              </div>
              
              {/* Help & Tips */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Wskazówki</h2>
                
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="font-medium text-white">Aktualizuj regularnie</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Staraj się aktualizować postęp przynajmniej raz dziennie.
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Komunikacja z klientem</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Informuj klienta o swoich postępach i odpowiadaj na jego pytania.
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-white">Bezpieczeństwo konta</span>
                    <p className="text-sm text-gray-400 mt-1">
                      Zawsze używaj VPN i nie zmieniaj żadnych ustawień konta klienta.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Link to="/booster/help" className="text-indigo-400 hover:text-indigo-300">
                    Potrzebujesz pomocy?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateOrderProgressPage;