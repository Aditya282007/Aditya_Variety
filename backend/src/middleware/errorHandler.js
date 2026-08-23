const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  console.error('Error handler received:', err);

  // Don't leak internal error details in production
  const isProd = process.env.NODE_ENV === 'production';
  
  // Generic messages for common error types
  let message = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    message = 'Validation failed';
    res.status(400);
  } else if (err.name === 'CastError') {
    message = 'Invalid resource ID';
    res.status(400);
  } else if (err.code === 11000) {
    message = 'Duplicate entry';
    res.status(409);
  } else if (err.message && !isProd) {
    // Only show actual error message in development
    message = err.message;
  } else if (err.message) {
    // For debugging: show error message even in production
    message = err.message;
  }

  console.log('Sending error response:', message);
  res.json({ message });
};

export default errorHandler;