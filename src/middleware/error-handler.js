function notFound(_req, res) {
  res.status(404).json({
    error: {
      message: 'Route not found',
    },
  });
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || error.statusCode || 500;

  res.status(status).json({
    error: {
      message: error.message || 'Internal Server Error',
      details: error.details,
    },
  });
}

module.exports = {
  errorHandler,
  notFound,
};
