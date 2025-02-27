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

    // ✅ Validate authorization header
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(new Error("Invalid bearer key", { cause: 400 }));
    }

    // ✅ Extract token safely
    const token = authorization.replace(process.env.BEARER_KEY, "").trim();
    if (!token) {
      return next(new Error("Missing Token", { cause: 404 }));
    }

    // ✅ Verify the token
    const decoded = verifyToken({
      token,
      signature: process.env.TOKEN_SIGNATURE,
    });
    console.log(decoded);

    if (!decoded?.id) {
      return next(new Error("Invalid payload token", { cause: 404 }));
    }

    // ✅ Fetch user from DB
    const user = await User.findById(decoded.id).select("phone");
    if (!user) {
      return next(new Error("Not registered account", { cause: 401 }));
    }

    // ✅ Handle role-based access
    if (accessRoles.length && !accessRoles.includes(user.role)) {
      return next(new Error("Not authorized account", { cause: 403 }));
    }

    // ✅ Attach user to request
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
