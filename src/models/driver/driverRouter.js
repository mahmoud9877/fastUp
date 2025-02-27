import express from "express";
import * as driverController from "./driver.js";
import { auth, roles } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/add_driver",
  // auth(roles.Admin),
  driverController.addDriver
);

router.delete(
  "/delete_driver/:driverId",
  //   auth(roles.Admin),
  driverController.deleteDriver
);

router.post(
  "/edit_profile",
  // auth(roles.Admin),
  driverController.editProfile
);

router.get(
  "/all_drivers",
  //   auth(roles.Admin),
  driverController.getAllDrivers
);

router.get(
  "/search",
  // auth(roles.Admin),
  driverController.searchDrivers
);

router.get(
  "/:driverId",
    auth(roles.Admin),
  driverController.getDriverById
);
// router.put(
//   "/update_driver/:driverId",
//   auth(roles.Admin),
//   driverController.updateDriver
// );

export default router;
