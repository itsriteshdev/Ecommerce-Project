class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]', err);

  const statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected error occurred';
  if (statusCode === 500 && !err.message) {
    message = 'An unexpected error occurred: ' + err.message;
  }

  res.status(statusCode).json({
    status: statusCode,
    message: message,
    timestamp: new Date().toISOString(),
    errors: err.errors || undefined
  });
};

module.exports = {
  AppError,
  errorHandler
};
