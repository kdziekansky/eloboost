import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, error, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Przekierowanie jeśli zalogowany
    if (isAuthenticated) {
      const redirectTo = location.state?.from || 
                        (user.role === 'client' ? '/client/dashboard' : '/booster/dashboard');
      navigate(redirectTo);
    }

    if (error) {
      setFormError(error);
      clearErrors();
    }
  }, [isAuthenticated, error, user, navigate, location, clearErrors]);

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setFormError('');
    setLoading(true);
    
    const success = await login({
      email,
      password
    });

    setLoading(false);
    
    // Przekierowanie jest obsługiwane przez useEffect gdy zmieni się stan uwierzytelnienia
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Logowanie</h1>
        
        {formError && (
          <div className="bg-red-900/30 border border-red-900 text-red-200 px-4 py-3 rounded mb-4">
            {formError}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
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
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2" htmlFor="password">Hasło</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded bg-indigo-600 text-white font-medium focus:outline-none ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-gray-400">
          Nie masz konta? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;