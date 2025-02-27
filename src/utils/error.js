import asyncHandler from "express-async-handler";

const ErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  // Wrong MongoDB ID error
  if (err.name === "CastError") {
    err = new asyncHandler(`Resource not found. Invalid: ${err.path}`, 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    err = new asyncHandler(
      `Duplicate ${Object.keys(err.keyValue)} entered`,
      400
    );
  }

  // Invalid JWT error
  if (err.name === "JsonWebTokenError") {
    err = new asyncHandler("Json web token is invalid, try again", 400);
  }

  // Expired JWT error
  if (err.name === "TokenExpiredError") {
    err = new asyncHandler("Json web token is expired, try again", 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default ErrorMiddleware;
