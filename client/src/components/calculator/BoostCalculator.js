import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const BoostCalculator = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Stany komponentu
  const [currentRating, setCurrentRating] = useState(1200);
  const [desiredRating, setDesiredRating] = useState(1500);
  const [options, setOptions] = useState({
    lobbyDuo: false,
    soloOnly: false,
    steamOfflineMode: false,
    premiumQueue: false,
    priority: false,
    superExpress: false,
    liveStream: false
  });
  const [finalPrice, setFinalPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [cashback, setCashback] = useState(0);
  const [pricePLN, setPricePLN] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Ceny za grę (25 punktów ELO) dla różnych poziomów - pomnożone przez 4
  const pricePerGameByLevel = [
    { maxRating: 800, price: 4.08 },   // 1-2LVL
    { maxRating: 950, price: 4.32 },   // 2-3LVL
    { maxRating: 1100, price: 5.68 },  // 3-4LVL
    { maxRating: 1250, price: 6.44 },  // 4-5LVL
    { maxRating: 1400, price: 7.28 },  // 5-6LVL
    { maxRating: 1550, price: 9.04 },  // 6-7LVL
    { maxRating: 1700, price: 8.80 },  // 7-8LVL
    { maxRating: 1850, price: 11.64 }, // 8-9LVL
    { maxRating: 2000, price: 15.96 }, // 9-10LVL
    { maxRating: 2500, price: 12.84 }  // 2000-2500
  ];

  // Base price calculation
  const calculateBasePrice = () => {
    let totalPrice = 0;
    let currentPoints = currentRating;
    const pointsPerGame = 25;
    
    while (currentPoints < desiredRating) {
      // Znajdź odpowiedni przedział cenowy na podstawie aktualnego ratingu
      const rangeIndex = pricePerGameByLevel.findIndex(range => currentPoints < range.maxRating);
      
      if (rangeIndex === -1) {
        // Jeśli jesteśmy poza zdefiniowanymi przedziałami, używamy ostatniego przedziału
        const pricePerGame = pricePerGameByLevel[pricePerGameByLevel.length - 1].price;
        const remainingPoints = desiredRating - currentPoints;
        const gamesNeeded = Math.ceil(remainingPoints / pointsPerGame);
        totalPrice += gamesNeeded * pricePerGame;
        break;
      }
      
      const currentRange = pricePerGameByLevel[rangeIndex];
      const pointsInThisRange = Math.min(currentRange.maxRating, desiredRating) - currentPoints;
      const gamesNeeded = Math.ceil(pointsInThisRange / pointsPerGame);
      
      totalPrice += gamesNeeded * currentRange.price;
      currentPoints = Math.min(currentRange.maxRating, currentPoints + (gamesNeeded * pointsPerGame));
    }
    
    return totalPrice;
  };
  
  // Calculate additional fees based on selected options
  const calculateAdditionalFees = (basePrice) => {
    let additionalFee = 0;
    
    if (options.lobbyDuo) additionalFee += basePrice * 0.1;
    if (options.soloOnly) additionalFee += basePrice * 0.15;
    if (options.steamOfflineMode) additionalFee += basePrice * 0.05;
    if (options.premiumQueue) additionalFee += basePrice * 0.2;
    if (options.priority) additionalFee += basePrice * 0.25;
    if (options.superExpress) additionalFee += basePrice * 0.3;
    if (options.liveStream) additionalFee += basePrice * 0.15;
    
    return additionalFee;
  };

  // Estimate completion time
  const calculateEstimatedTime = () => {
    const pointDifference = desiredRating - currentRating;
    // Zakładamy średnio 6 meczów na godzinę, każdy mecz to ok. 25 punktów
    const hours = (pointDifference / 25) / 6;
    
    let baseTime = '';
    if (hours < 24) {
      baseTime = `${Math.ceil(hours)} godzin`;
    } else {
      const days = Math.ceil(hours / 24);
      baseTime = `${days} ${days === 1 ? 'dzień' : 'dni'}`;
    }
    
    // Adjust for priority and super express options
    if (options.superExpress) {
      return `~${Math.ceil(hours * 0.6)} godzin (Super Express)`;
    } else if (options.priority) {
      return `~${Math.ceil(hours * 0.8)} godzin (Priorytet)`;
    }
    
    return `~${baseTime}`;
  };
  
  // Calculate final price
  useEffect(() => {
    const basePrice = calculateBasePrice();
    const additionalFees = calculateAdditionalFees(basePrice);
    const total = basePrice + additionalFees;
    
    setOriginalPrice(Math.round(total));
    setFinalPrice(Math.round(total * 0.95)); // 5% discount from original
    setCashback(Math.round(total * 0.01)); // 1% cashback
    setPricePLN(Math.round(total * 0.95 * 4)); // Przeliczenie na złotówki (kurs x4)
    setEstimatedTime(calculateEstimatedTime());
  }, [currentRating, desiredRating, options]);
  
  // Handle rating changes
  const handleCurrentRatingChange = (change) => {
    setCurrentRating(prev => {
      const newValue = Math.max(0, prev + change);
      return newValue > desiredRating ? desiredRating : newValue;
    });
  };
  
  const handleDesiredRatingChange = (change) => {
    setDesiredRating(prev => Math.max(currentRating, prev + change));
  };
  
  // Handle option toggle
  const toggleOption = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Current and desired ranks visualization
  const getRankColor = (rating) => {
    if (rating < 800) return '#777'; // szary dla najniższych poziomów
    if (rating < 950) return '#a0a0a0';
    if (rating < 1100) return '#c0c0c0';
    if (rating < 1250) return '#fcba03'; // żółty
    if (rating < 1400) return '#ffcb41';
    if (rating < 1550) return '#ffd966';
    if (rating < 1700) return '#09a9f4'; // niebieski
    if (rating < 1850) return '#29b6f6';
    if (rating < 2000) return '#4fc3f7';
    return '#ff5722'; // pomarańczowy/czerwony dla najwyższych
  };
  
  const getRankLevel = (rating) => {
    if (rating < 800) return 1;
    if (rating < 950) return 2;
    if (rating < 1100) return 3;
    if (rating < 1250) return 4;
    if (rating < 1400) return 5;
    if (rating < 1550) return 6;
    if (rating < 1700) return 7;
    if (rating < 1850) return 8;
    if (rating < 2000) return 9;
    return 10;
  };

  // Obsługa zamówienia
  const handleOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: 'calculator' } });
      return;
    }

    setLoading(true);
    
    try {
      // W pełnej implementacji, tutaj wysłalibyśmy zamówienie do API
      // const response = await axios.post('/api/orders', orderData);
      
      // Dla teraz, po prostu przekierujemy do strony potwierdzenia
      setTimeout(() => {
        navigate('/client/orders');
      }, 1000);
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col bg-gray-900 text-white p-6 rounded-lg w-full max-w-5xl mx-auto shadow-xl">
      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        <button className="px-4 py-2 font-medium text-white border-b-2 border-indigo-500 whitespace-nowrap">By Elo</button>
        <button className="px-4 py-2 font-medium text-gray-400 whitespace-nowrap">By Level</button>
        <button className="px-4 py-2 font-medium text-gray-400 whitespace-nowrap">By Wins</button>
        <button className="px-4 py-2 font-medium text-gray-400 whitespace-nowrap">Placement Matches</button>
        <button className="px-4 py-2 font-medium text-gray-400 whitespace-nowrap">Faceit Accounts</button>
      </div>
      
      {/* Rating Selectors */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
        {/* Current Rating */}
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-20 h-20 md:w-24 md:h-24 mr-4 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800 flex items-center justify-center bg-gray-800">
              <div style={{ 
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: getRankColor(currentRating),
                borderRadius: '9999px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="text-3xl font-bold" style={{ color: getRankColor(currentRating) }}>
                  {getRankLevel(currentRating)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="w-full">
            <div className="text-gray-400 mb-2">Current rating</div>
            <div className="flex items-center">
              <button 
                className="w-12 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center"
                onClick={() => handleCurrentRatingChange(-25)}
              >
                -25
              </button>
              <input 
                type="text" 
                className="w-full md:w-32 h-10 mx-2 bg-gray-800 text-white text-center rounded-lg"
                value={currentRating}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value)) {
                    setCurrentRating(value);
                  }
                }}
              />
              <button 
                className="w-12 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center"
                onClick={() => handleCurrentRatingChange(25)}
              >
                +25
              </button>
            </div>
          </div>
        </div>
        
        {/* Arrow Divider */}
        <div className="mx-4 w-10 h-10 flex-shrink-0 flex items-center justify-center bg-indigo-600 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        
        {/* Desired Rating */}
        <div className="flex items-center w-full md:w-auto">
          <div className="w-full">
            <div className="text-gray-400 mb-2">Desired rating</div>
            <div className="flex items-center">
              <button 
                className="w-12 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center"
                onClick={() => handleDesiredRatingChange(-25)}
              >
                -25
              </button>
              <input 
                type="text" 
                className="w-full md:w-32 h-10 mx-2 bg-gray-800 text-white text-center rounded-lg"
                value={desiredRating}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!isNaN(value) && value >= currentRating) {
                    setDesiredRating(value);
                  }
                }}
              />
              <button 
                className="w-12 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center"
                onClick={() => handleDesiredRatingChange(25)}
              >
                +25
              </button>
            </div>
          </div>
          
          <div className="relative w-20 h-20 md:w-24 md:h-24 ml-4 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800 flex items-center justify-center bg-gray-800">
              <div style={{ 
                borderWidth: '4px',
                borderStyle: 'solid',
                borderColor: getRankColor(desiredRating),
                borderRadius: '9999px',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span className="text-3xl font-bold" style={{ color: getRankColor(desiredRating) }}>
                  {getRankLevel(desiredRating)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="lobbyDuo" 
            className="w-5 h-5 mr-2"
            checked={options.lobbyDuo} 
            onChange={() => toggleOption('lobbyDuo')}
          />
          <label htmlFor="lobbyDuo" className="mr-1">Lobby/Duo</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Graj z naszym boosterem w lobby. Możesz uczestniczyć w boostingu."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="soloOnly" 
            className="w-5 h-5 mr-2"
            checked={options.soloOnly} 
            onChange={() => toggleOption('soloOnly')}
          />
          <label htmlFor="soloOnly" className="mr-1">Solo Only</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Booster będzie grał tylko solo, bez party."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="steamOfflineMode" 
            className="w-5 h-5 mr-2"
            checked={options.steamOfflineMode} 
            onChange={() => toggleOption('steamOfflineMode')}
          />
          <label htmlFor="steamOfflineMode" className="mr-1">Steam Offline Mode</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Twój profil będzie ustawiony jako offline podczas boostingu."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="premiumQueue" 
            className="w-5 h-5 mr-2"
            checked={options.premiumQueue} 
            onChange={() => toggleOption('premiumQueue')}
          />
          <label htmlFor="premiumQueue" className="mr-1">Premium Queue</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Granie tylko w kolejkach premium Faceit."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="priority" 
            className="w-5 h-5 mr-2"
            checked={options.priority} 
            onChange={() => toggleOption('priority')}
          />
          <label htmlFor="priority" className="mr-1">Priority</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Twoje zamówienie będzie miało priorytet i zostanie zrealizowane szybciej."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="superExpress" 
            className="w-5 h-5 mr-2"
            checked={options.superExpress} 
            onChange={() => toggleOption('superExpress')}
          />
          <label htmlFor="superExpress" className="mr-1">Super Express</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Najwyższy priorytet, realizacja w ekspresowym tempie."
          >?</div>
        </div>
        
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="liveStream" 
            className="w-5 h-5 mr-2"
            checked={options.liveStream} 
            onChange={() => toggleOption('liveStream')}
          />
          <label htmlFor="liveStream" className="mr-1">Live Stream</label>
          <div 
            className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-sm ml-1 cursor-help"
            title="Boosting będzie transmitowany na prywatnym streamie, abyś mógł obserwować postępy."
          >?</div>
        </div>
      </div>
      
      {/* Pricing and Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Final Price */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 mb-2">Final price</div>
          <div className="flex items-center">
            <span className="text-3xl font-bold">€ {finalPrice.toFixed(2)}</span>
            <span className="text-gray-400 ml-2 line-through">€{originalPrice}</span>
          </div>
          <div className="text-sm text-gray-400">Cashback: €{cashback.toFixed(2)}</div>
          <div className="text-sm text-blue-400 mt-1">PLN: {pricePLN.toFixed(2)} zł</div>
        </div>
        
        {/* Booster Assignment */}
        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Booster Assigned</div>
            <div className="text-gray-400">In 5 Minutes</div>
          </div>
        </div>
        
        {/* Execution Time */}
        <div className="bg-gray-800 rounded-lg p-4 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium">Execution Time</div>
            <div className="text-gray-400">{estimatedTime}</div>
          </div>
        </div>
      </div>
      
      {/* Order Button */}
      <button 
        onClick={handleOrder}
        disabled={loading || currentRating >= desiredRating}
        className={`w-full py-4 rounded-lg font-medium text-lg mb-6 ${
          loading || currentRating >= desiredRating
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {loading ? 'Przetwarzanie...' : 'Zamów teraz'}
      </button>
      
      {/* Payment Methods and Support */}
      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex space-x-4 mb-4 md:mb-0">
          <svg className="h-8 w-12 text-gray-400" viewBox="0 0 32 20" fill="currentColor">
            <rect width="32" height="20" rx="2" fill="#1E293B" />
            <path d="M8 14h16M8 8h8" stroke="currentColor" strokeWidth="2" />
          </svg>
          <svg className="h-8 w-12 text-gray-400" viewBox="0 0 32 20" fill="currentColor">
            <circle cx="16" cy="10" r="8" fill="#1E293B" />
            <circle cx="12" cy="10" r="6" fill="#1E293B" />
            <circle cx="20" cy="10" r="6" fill="#1E293B" />
          </svg>
          <svg className="h-8 w-12 text-gray-400" viewBox="0 0 32 20" fill="currentColor">
            <rect width="32" height="20" rx="2" fill="#1E293B" />
          </svg>
          <svg className="h-8 w-12 text-gray-400" viewBox="0 0 32 20" fill="currentColor">
            <rect width="32" height="20" rx="2" fill="#1E293B" />
          </svg>
        </div>
        
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">Got Any Questions?</span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Live Chat
          </button>
        </div>
      </div>
      
      {/* Customer Rating */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-2 md:mb-0">The average rating from our users is <span className="font-bold">5.0</span></div>
        <div className="flex items-center">
          <span className="mr-2 font-medium">Feedback from Customers</span>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoostCalculator;