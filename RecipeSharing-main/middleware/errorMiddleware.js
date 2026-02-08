function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
}

function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
    // полезно на защите; на деплое можно выключать
    stack: process.env.NODE_ENV === "production" ? "🥷" : err.stack
  });
}

module.exports = { notFound, errorHandler };
