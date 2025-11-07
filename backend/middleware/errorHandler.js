/**
 * Global error handling middleware
 * Catches all errors and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error("\n════════════════════════════════════════");
  console.error("❌ ERROR CAUGHT BY ERROR HANDLER");
  console.error("════════════════════════════════════════");
  console.error("Path:", req.path);
  console.error("Method:", req.method);
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  if (process.env.NODE_ENV === "development") {
    console.error("Stack:", err.stack);
  }
  console.error("════════════════════════════════════════\n");

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Invalid ID format";
    error = { message, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    error:
      process.env.NODE_ENV === "development"
        ? {
            stack: err.stack,
            details: err,
          }
        : undefined,
  });
};

module.exports = errorHandler;
