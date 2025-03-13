import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Tworzenie kontekstu
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ładowanie użytkownika przy pierwszym załadowaniu
  useEffect(() => {
    loadUser();
  }, []);

  // Funkcja ładująca dane użytkownika
  const loadUser = async () => {
    try {
      // Pobierz token z localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Ustaw nagłówki autoryzacji
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await axios.get('/api/auth/me');
      
      setUser(res.data.data);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      setError(err.response?.data?.error || 'Wystąpił błąd');
    }
  };

  // Rejestracja użytkownika
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd rejestracji');
      return false;
    }
  };

  // Logowanie użytkownika
  const login = async (formData) => {
    try {
      const res = await axios.post('/api/auth/login', formData);
      
      localStorage.setItem('token', res.data.token);
      
      await loadUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Nieprawidłowe dane logowania');
      return false;
    }
  };

  // Wylogowanie
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Czyszczenie błędów
  const clearErrors = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        clearErrors
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;