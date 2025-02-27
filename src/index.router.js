import dotenv from "dotenv";
dotenv.config();
import connectDB from "../DB/connection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import ErrorMiddleware from "./utils/error.js";
import userRouter from "./models/auth/authRouter.js";
import driverRouter from "./models/driver/driverRouter.js";
import shipmentRouter from "./models/shipment/shipmentRouter.js";

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initApp = (app, express) => {
  // ✅ Connect to DB first
  connectDB();

  // ✅ Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // ✅ CORS with environment variable
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );

  // ✅ Routes
  app.use("/auth", userRouter);
  app.use("/driver", driverRouter);
  app.use("/shipment", shipmentRouter);

  // ✅ Testing API
  app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "API is working" });
  });

  // ✅ Handle unknown routes
  app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
  });

  // ✅ Error Middleware
  app.use(ErrorMiddleware);
};

export default initApp;
