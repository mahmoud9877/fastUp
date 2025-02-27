import User from "../../DB/models/userModel.js";
import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/GenerateAndVerifyToken.js";

export const roles = {
  Admin: "Admin",
  Driver: "Driver",
};

// Authentication middleware
export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    // Check if authorization header starts with the correct bearer key
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("Invalid bearer key", { cause: 400 }));
    }

    // Extract the token from the authorization header
    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(new Error("Missing Token", { cause: 404 }));
    }

    // Verify the token
    const decoded = verifyToken({ token });
    if (!decoded?.id) {
      return next(new Error("Invalid payload token", { cause: 404 }));
    }

    // Find the user by ID and select specific fields
    const user = await User.findById(decoded.id).select(
      "userName email image role status"
    );
    if (!user) {
      return next(new Error("Not registered account", { cause: 401 }));
    }
    if (!accessRoles.includes(user.role)) {
      return next(new Error("Not authorized account", { cause: 401 }));
    }

    // Attach user to the request object
    req.user = user;
    return next();
  });
};

// import jwt from "jsonwebtoken";

// // ✅ Middleware to check if user is authenticated
// export const isAuthenticated = (req, res, next) => {
//   const token = req.header("Authorization");

//   if (!token) {
//     return res.status(401).json({ message: "Access denied" });
//   }

//   try {
//     const decoded = jwt.verify(
//       token.replace("Bearer ", ""),
//       process.env.JWT_SECRET
//     );
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };

// // ✅ Middleware to check user roles
// export const authorizeRoles = (role) => {
//   return (req, res, next) => {
//     // ✅ التحقق مما إذا كان المستخدم مسجل الدخول
//     if (!req.user) {
//       return res.status(403).json({ message: "User is not authenticated" });
//     }

//     // ✅ التحقق مما إذا كان المستخدم لديه الدور المطلوب
//     if (req.user.role !== role) {
//       return res.status(403).json({
//         message: `Role: ${req.user.role} is not allowed to access this resource`,
//       });
//     }

//     next();
//   };
// };
