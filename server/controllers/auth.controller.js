const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Rejestracja użytkownika
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  console.log('Próba rejestracji:', { name, email, role });

  // Upewnij się, że użytkownik nie może samodzielnie stać się adminem
  const userRole = role === 'booster' ? 'booster' : 'client';

  try {
    // Rejestracja z Supabase Auth (zaktualizowana metoda)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role: userRole
        }
      }
    });

    console.log('Odpowiedź auth.signUp:', authData ? 'Sukces' : 'Błąd', authError || '');

    if (authError) {
      console.error('Błąd rejestracji Supabase Auth:', authError);
      return next(new ErrorResponse(authError.message, 400));
    }

    // Sprawdź, czy mamy dane użytkownika
    if (!authData || !authData.user || !authData.user.id) {
      console.error('Brak danych użytkownika w odpowiedzi Supabase');
      return next(new ErrorResponse('Błąd rejestracji: brak danych użytkownika', 500));
    }

    // Dodanie rekordu w naszej tabeli users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          id: authData.user.id,
          email, 
          name, 
          role: userRole
        }
      ])
      .select();

    console.log('Odpowiedź insert do users:', userData ? 'Sukces' : 'Błąd', userError || '');

    if (userError) {
      console.error('Błąd dodawania do tabeli users:', userError);
      return next(new ErrorResponse(userError.message, 500));
    }

    sendTokenResponse(authData.user, 200, res);
  } catch (err) {
    console.error('Nieoczekiwany błąd podczas rejestracji:', err);
    return next(new ErrorResponse('Błąd serwera podczas rejestracji', 500));
  }
});

// @desc    Logowanie użytkownika
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Podaj email i hasło', 400));
  }

  try {
    // Logowanie z Supabase Auth (zaktualizowana metoda)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Błąd logowania:', authError);
      return next(new ErrorResponse('Nieprawidłowe dane logowania', 401));
    }

    sendTokenResponse(authData.user, 200, res);
  } catch (err) {
    console.error('Nieoczekiwany błąd podczas logowania:', err);
    return next(new ErrorResponse('Błąd serwera podczas logowania', 500));
  }
});

// @desc    Wylogowanie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Pobierz dane zalogowanego użytkownika
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  try {
    // Pobierz informacje o użytkowniku z naszej bazy danych
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Błąd pobierania danych użytkownika:', error);
      return next(new ErrorResponse('Brak autoryzacji', 401));
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Nieoczekiwany błąd przy pobieraniu danych użytkownika:', err);
    return next(new ErrorResponse('Błąd serwera', 500));
  }
});

// Funkcja pomocnicza do generowania tokena JWT
const sendTokenResponse = (user, statusCode, res) => {
  // Utwórz token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};