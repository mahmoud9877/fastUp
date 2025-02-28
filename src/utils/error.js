import asyncHandler from "express-async-handler";

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // ✅ Wrong MongoDB ID error (Invalid ID format)
  if (err.name === "CastError") {
    err.statusCode = 400;
    err.message = `Resource not found. Invalid ID: ${err.path}`;
  }

  // ✅ Duplicate key error (MongoDB Unique Constraint)
  if (err.code === 11000) {
    err.statusCode = 400;
    err.message = `Duplicate ${Object.keys(err.keyValue)} entered`;
  }

  // ✅ Invalid JWT error
  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message = "Invalid token, please try again";
  }

  // ✅ Expired JWT error
  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = "Token has expired, please login again";
  }

  // ✅ Send response without modifying original error object
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
