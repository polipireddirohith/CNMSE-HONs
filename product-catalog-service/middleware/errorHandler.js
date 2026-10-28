/**
 * Centralized Error Handling Middleware for Product Catalog Microservice
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Log error in development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Handler] ${err.name}: ${err.message}`);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid resource identifier: '${err.value}' for field '${err.path}'.`;
    return res.status(400).json({
      success: false,
      error: 'Invalid ID Format',
      message
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const fieldErrors = {};
    Object.values(err.errors).forEach((val) => {
      fieldErrors[val.path] = val.message;
    });

    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      message: 'One or more required fields are invalid or missing.',
      fieldErrors
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: 'Duplicate Key Error',
      message: `A product with that ${field} already exists.`
    });
  }

  // Express / JSON parse syntax error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON',
      message: 'The request payload contains invalid JSON formatting.'
    });
  }

  // Generic Internal Server Error
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.error || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred on the server.'
  });
};

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
