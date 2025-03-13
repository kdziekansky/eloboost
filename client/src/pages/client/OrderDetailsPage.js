import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import OrderStatusBadge from '../../components/ui/OrderStatusBadge';
import MessageChat from '../../components/chat/MessageChat';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [booster, setBooster] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  
  // Pobierz dane zamówienia
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Pobierz dane zamówienia
      const orderResponse = await axios.get(`/api/orders/${id}`);
      setOrder(orderResponse.data.data);
      
      // Pobierz dane boostera (jeśli jest przypisany)
      if (orderResponse.data.data.booster_id) {
        // W pełnej implementacji, tutaj pobralibyśmy dane boostera z API
        // Dla teraz, zasymulujmy te dane
        setBooster({
          id: orderResponse.data.data.booster_id,
          name: 'Booster #' + orderResponse.data.data.booster_id.substring(0, 4),
          rating: 4.8,
          completedOrders: 157,
          faceitLevel: 10,
          faceitElo: 3200,
          experience: '3 lata'
        });
      }
      
      // Pobierz historię zamówienia
      const timelineResponse = await axios.get(`/api/orders/${id}/timeline`);
      setTimeline(timelineResponse.data.data);
      
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
  
  // Obsługa wysyłania opinii
  const handleSubmitFeedback = async () => {
    if (feedback.rating === 0) {
      return; // Wymagana ocena
    }
    
    try {
      setSubmittingFeedback(true);
      
      const response = await axios.post(`/api/orders/${id}/feedback`, {
        rating: feedback.rating,
        comment: feedback.comment
      });
      
      // Odśwież dane zamówienia
      setOrder({
        ...order,
        feedback_rating: feedback.rating,
        feedback_comment: feedback.comment,
        feedback_given_at: new Date().toISOString()
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się wysłać opinii');
      console.error('Error submitting feedback:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };
  
  // Format daty
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Oblicz procent ukończenia
  const calculateProgress = () => {
    if (!order) return 0;
    
    if (order.order_type === 'eloBoosting') {
      const startRating = order.current_rating;
      const targetRating = order.desired_rating;
      const currentRating = order.current_progress_rating || startRating;
      
      return Math.min(100, Math.round(((currentRating - startRating) / (targetRating - startRating)) * 100));
    } else if (order.order_type === 'winsBoost') {
      const completed = order.current_progress_wins || 0;
      const total = order.wins_required;
      
      return Math.min(100, Math.round((completed / total) * 100));
    } else if (order.order_type === 'placementMatches') {
      const completed = order.current_progress_matches || 0;
      const total = order.placement_matches;
      
      return Math.min(100, Math.round((completed / total) * 100));
    }
    
    return 0;
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
  
  // Aktualny postęp zamówienia w zależności od typu
  const getCurrentProgress = () => {
    if (!order) return '';
    
    switch (order.order_type) {
      case 'eloBoosting':
        const currentRating = order.current_progress_rating || order.current_rating;
        return `${currentRating} / ${order.desired_rating} ELO`;
      case 'winsBoost':
        const winsCompleted = order.current_progress_wins || 0;
        return `${winsCompleted} / ${order.wins_required} zwycięstw`;
      case 'placementMatches':
        const matchesCompleted = order.current_progress_matches || 0;
        return `${matchesCompleted} / ${order.placement_matches} meczy`;
      default:
        return '';
    }
  };
  
  // Możliwość anulowania zamówienia
  const canCancelOrder = () => {
    if (!order) return false;
    
    return order.status === 'pending';
  };
  
  // Obsługa anulowania zamówienia
  const handleCancelOrder = async () => {
    if (!canCancelOrder()) return;
    
    if (!window.confirm('Czy na pewno chcesz anulować to zamówienie?')) {
      return;
    }
    
    try {
      const response = await axios.put(`/api/orders/${id}`, {
        status: 'cancelled'
      });
      
      // Odśwież dane zamówienia
      setOrder({
        ...order,
        status: 'cancelled'
      });
      
      // Dodaj wpis do timeline
      setTimeline([
        ...timeline,
        {
          status: 'cancelled',
          created_at: new Date().toISOString(),
          note: 'Zamówienie zostało anulowane przez klienta'
        }
      ]);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się anulować zamówienia');
      console.error('Error cancelling order:', err);
    }
  };
  
  // Możliwość oceny zamówienia
  const canLeaveFeedback = () => {
    if (!order) return false;
    
    return (
      order.status === 'completed' && 
      !order.feedback_given_at && 
      order.booster_id
    );
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
            <Link to="/client/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/client/orders" className="hover:text-gray-300">Zamówienia</Link>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Szczegóły zamówienia</span>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/20 border border-red-900 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main order info */}
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
                
                {/* Progress bar */}
                {(order.status === 'inProgress' || order.status === 'completed') && (
                  <div className="mt-6">
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
                      {getCurrentProgress()}
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {canCancelOrder() && (
                    <button 
                      onClick={handleCancelOrder}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Anuluj zamówienie
                    </button>
                  )}
                  
                  {order.status === 'pending' && (
                    <Link 
                      to="/calculator"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Zamów ponownie
                    </Link>
                  )}
                </div>
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
                      
                      {/* Update account form */}
                      <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-700">
                        <div className="text-gray-400 mb-4">Zmiana danych logowania</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="login" className="block text-gray-400 mb-1">Login</label>
                            <input
                              type="text"
                              id="login"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              defaultValue={order.account_login}
                            />
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-gray-400 mb-1">Hasło</label>
                            <input
                              type="text"
                              id="password"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                              defaultValue={order.account_password}
                            />
                          </div>
                        </div>
                        <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition duration-200">
                          Zaktualizuj dane
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      Dane konta są ukryte ze względów bezpieczeństwa.
                    </div>
                  )}
                </div>
              )}
              
              {/* Feedback section */}
              {order.status === 'completed' && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-lg font-bold mb-4">Opinia</h2>
                  
                  {order.feedback_given_at ? (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="mr-2">Twoja ocena:</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-5 w-5 ${star <= order.feedback_rating ? 'text-yellow-400' : 'text-gray-600'}`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      
                      {order.feedback_comment && (
                        <div>
                          <div className="text-gray-400 mb-2">Twój komentarz:</div>
                          <div className="bg-gray-700 rounded-lg p-3">
                            {order.feedback_comment}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-gray-400 text-sm mt-4">
                        Opinia dodana {formatDate(order.feedback_given_at)}
                      </div>
                    </div>
                  ) : canLeaveFeedback() ? (
                    <div>
                      <div className="mb-4">
                        <div className="text-gray-400 mb-2">Ocena boostera:</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedback({...feedback, rating: star})}
                              className="focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-8 w-8 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-300 transition-colors`}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="feedback" className="block text-gray-400 mb-2">Komentarz (opcjonalnie):</label>
                        <textarea
                          id="feedback"
                          rows="3"
                          value={feedback.comment}
                          onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          placeholder="Napisz opinię o boosterze..."
                        ></textarea>
                      </div>
                      
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={feedback.rating === 0 || submittingFeedback}
                        className={`px-4 py-2 rounded-lg ${
                          feedback.rating === 0 || submittingFeedback
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {submittingFeedback ? 'Wysyłanie...' : 'Wyślij opinię'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      Nie można dodać opinii dla tego zamówienia.
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
              {/* Booster info */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Booster</h2>
                
                {booster ? (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xl font-bold">{booster.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{booster.name}</div>
                        <div className="flex items-center text-sm text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {booster.rating} ({booster.completedOrders} zamówień)
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-gray-400 text-sm">Poziom Faceit</div>
                        <div className="font-medium">{booster.faceitLevel} ({booster.faceitElo} ELO)</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Doświadczenie</div>
                        <div className="font-medium">{booster.experience}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {order.status === 'pending' 
                      ? 'Booster jeszcze nie został przypisany do tego zamówienia.' 
                      : 'Informacje o boosterze są niedostępne.'}
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
              
              {/* Order Timeline */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-bold mb-4">Historia zamówienia</h2>
                
                <div className="space-y-4">
                  {timeline.length > 0 ? (
                    timeline.map((event, index) => (
                      <div key={index} className="relative pl-6 pb-4">
                        {/* Timeline connector */}
                        {index < timeline.length - 1 && (
                          <div className="absolute top-0 left-[11px] h-full w-0.5 bg-gray-700"></div>
                        )}
                        
                        {/* Status dot */}
                        <div className="absolute top-0 left-0 w-[23px] h-[23px] rounded-full border-2 border-gray-700 flex items-center justify-center">
                          <div 
                            className={`w-3 h-3 rounded-full ${
                              event.status === 'pending' ? 'bg-yellow-500' :
                              event.status === 'inProgress' ? 'bg-blue-500' :
                              event.status === 'completed' ? 'bg-green-500' :
                              event.status === 'cancelled' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`}
                          ></div>
                        </div>
                        
                        {/* Event content */}
                        <div>
                          <div className="font-medium">
                            {event.status === 'pending' ? 'Oczekujące' :
                             event.status === 'inProgress' ? 'W trakcie' :
                             event.status === 'completed' ? 'Ukończone' :
                             event.status === 'cancelled' ? 'Anulowane' :
                             event.status}
                          </div>
                          {event.note && (
                            <div className="text-gray-400">{event.note}</div>
                          )}
                          <div className="text-gray-400 text-sm mt-1">
                            {formatDate(event.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">
                      Brak danych o historii zamówienia.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;