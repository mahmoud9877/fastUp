// class asyncHandler extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//     this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
//     this.isOperational = true;
//     Error.captureStackTrace(this, this.constructor);
//   }
// }

// // Export as ES6 module
// export default asyncHandler;

export const globalErrorHandling = (err, req, res, next) => {
  if (err) {
    if (process.env.MOOD == "DEV") {
      return res
        .status(err.cause || 500)
        .json({ message: err.message, err, stack: err.stack });
    }
    return res.status(err.cause || 500).json({ message: err.message });
  }
};
