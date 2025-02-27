import express from "express";
import { auth, roles } from "../../middleware/authMiddleware.js";
import * as authController from "./auth.js";
import * as validators from "./authValidation.js";
import { validation } from "../../middleware/validation.js";
const router = express.Router();

router.post(
  "/signup",
  validation(validators.createAdmin),
  authController.createAdmin
);
router.post("/login", validation(validators.login), authController.login);
router.post(
  "/change_password",
  auth(roles.Admin),
  authController.changePassword
);

router.get("/all_admins", authController.getAllAdmins);

export default router;
