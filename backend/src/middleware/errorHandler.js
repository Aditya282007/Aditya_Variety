const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

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
  }

  res.json({
    message,
    ...(!isProd && { stack: err.stack })
  });
};

export default errorHandler;