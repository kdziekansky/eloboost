import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client'
  });

  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Przekierowanie jeśli zalogowany
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    if (error) {
      setFormError(error);
      clearErrors();
    }
  }, [isAuthenticated, error, navigate, clearErrors]);

  const { name, email, password, confirmPassword, role } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setFormError('');

    if (password !== confirmPassword) {
      setFormError('Hasła nie są identyczne');
      return;
    }

    setLoading(true);
    
    const success = await register({
      name,
      email,
      password,
      role
    });

    setLoading(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Utwórz konto</h1>
        
        {formError && (
          <div className="bg-red-900/30 border border-red-900 text-red-200 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="name">Imię</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              required
              minLength="6"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Chcę</label>
            <div className="flex">
              <label className="inline-flex items-center mr-6">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={role === 'client'}
                  onChange={onChange}
                  className="text-indigo-600"
                />
                <span className="ml-2 text-gray-300">Zatrudnić Boostera</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="booster"
                  checked={role === 'booster'}
                  onChange={onChange}
                  className="text-indigo-600"
                />
                <span className="ml-2 text-gray-300">Zostać Boosterem</span>
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded bg-indigo-600 text-white font-medium focus:outline-none ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-400">
          Masz już konto? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;