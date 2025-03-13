const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const supabase = require('../config/supabase');

// Middleware do ochrony tras
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Pobierz token z nagłówka Bearer
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Pobierz token z ciasteczka
    token = req.cookies.token;
  }

  // Upewnij się, że token istnieje
  if (!token) {
    return next(new ErrorResponse('Brak autoryzacji do dostępu do tej trasy', 401));
  }

  try {
    // Weryfikacja tokena
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pobierz użytkownika z bazy danych
    const { data, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', decoded.id)
      .single();

    if (error || !data) {
      return next(new ErrorResponse('Brak autoryzacji do dostępu do tej trasy', 401));
    }

    req.user = data;
    next();
  } catch (err) {
    return next(new ErrorResponse('Brak autoryzacji do dostępu do tej trasy', 401));
  }
});

// Ograniczenie dostępu do określonych ról
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Rola ${req.user.role} nie ma uprawnień do dostępu do tej trasy`,
          403
        )
      );
    }
    next();
  };
};