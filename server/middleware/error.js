const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log dla deweloperów
  console.log(err);

  // Błędy Supabase
  if (err.code) {
    error = new ErrorResponse(err.message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Błąd serwera'
  });
};

module.exports = errorHandler;