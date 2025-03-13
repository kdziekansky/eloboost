import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

const MessageChat = ({ orderId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const messageAreaRef = useRef(null);

  // Pobierz wiadomości
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/messages/${orderId}`);
      setMessages(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się pobrać wiadomości');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pobierz wiadomości przy pierwszym renderowaniu i ustaw interwał odświeżania
  useEffect(() => {
    fetchMessages();

    // Odświeżaj wiadomości co 10 sekund
    const interval = setInterval(fetchMessages, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  // Przewiń do ostatniej wiadomości po załadowaniu lub dodaniu nowej
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Wyślij nową wiadomość
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      const response = await axios.post(`/api/messages/${orderId}`, {
        content: newMessage.trim()
      });
      
      // Dodaj nową wiadomość do listy
      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Nie udało się wysłać wiadomości');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  // Formatuj datę wiadomości
  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Grupuj wiadomości według daty (dzień)
  const groupMessagesByDay = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const day = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!groups[day]) {
        groups[day] = [];
      }
      
      groups[day].push(message);
    });
    
    return Object.entries(groups).map(([day, messages]) => ({
      date: new Date(day),
      messages
    }));
  };

  // Określ czy wiadomość jest od bieżącego użytkownika
  const isOwnMessage = (message) => {
    return message.users.id === user.id;
  };

  // Generuj etykietę daty
  const formatDayLabel = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Dzisiaj';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Wczoraj';
    } else {
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  // Przypisz odpowiedni kolor do roli użytkownika
  const getRoleColor = (role) => {
    switch (role) {
      case 'client':
        return 'bg-indigo-600 text-white';
      case 'booster':
        return 'bg-green-600 text-white';
      case 'admin':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
        <h3 className="text-lg font-medium text-white">Wiadomości</h3>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={messageAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
        style={{ maxHeight: '400px' }}
      >
        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-800 rounded-md p-3 text-red-200">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            Brak wiadomości. Rozpocznij konwersację.
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              {/* Date Divider */}
              <div className="flex items-center justify-center">
                <div className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                  {formatDayLabel(group.date)}
                </div>
              </div>
              
              {/* Day Messages */}
              {group.messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex max-w-[80%]">
                    {/* Avatar for other's messages */}
                    {!isOwnMessage(message) && (
                      <div className="self-end mb-2 mr-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white uppercase bg-gray-600">
                          {message.users.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    
                    {/* Message Content */}
                    <div className="flex flex-col">
                      {/* Name and role for other's messages */}
                      {!isOwnMessage(message) && (
                        <div className="flex items-center mb-1">
                          <span className="text-sm font-medium text-gray-300 mr-2">
                            {message.users.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(message.users.role)}`}>
                            {message.users.role === 'client' ? 'Klient' : 
                             message.users.role === 'booster' ? 'Booster' : 'Admin'}
                          </span>
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div 
                        className={`rounded-lg px-4 py-2 ${
                          isOwnMessage(message) 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-gray-700 text-white rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Timestamp */}
                      <div 
                        className={`text-xs text-gray-400 mt-1 ${
                          isOwnMessage(message) ? 'text-right' : 'text-left'
                        }`}
                      >
                        {formatMessageDate(message.created_at)}
                      </div>
                    </div>
                    
                    {/* Avatar for own messages */}
                    {isOwnMessage(message) && (
                      <div className="self-end mb-2 ml-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white uppercase bg-indigo-600">
                          {user.name.charAt(0)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-600">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Wpisz wiadomość..."
            className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`px-4 py-2 rounded-r-lg ${
              sending || !newMessage.trim()
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {sending ? (
              <div className="w-6 h-6 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              'Wyślij'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageChat;