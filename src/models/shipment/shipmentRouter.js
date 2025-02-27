import express from "express";
// import {
//   changePassword,
//   editProfile,
//   getAllDrivers,
//   deleteUser,
//   searchDrivers,
//   getDriverById,
// } from "../auth/auth.js";

import { auth, roles } from "../../middleware/authMiddleware.js";
import * as shipmentController from "./shipment.js";

import upload from "../../utils/imageConfigure.js";

const router = express.Router();

// router.post("/add_shipment", auth(roles.Admin), shipmentController.addShipment);
// router.put(
//   "/edit_shipment/:shipmentId",
//   auth(roles.Admin),
//   shipmentController.editShipment
// );
// router.get("/all_shipments", shipmentController.getAllShipments);
// router.get("/:shipmentId", shipmentController.getShipmentById);
// router.get("/search_shipments", shipmentController.searchShipments);
// router.put("/addPolicy/:shipmentId", shipmentController.updatePolicyImage);

// router.put(
//   "/shipment/:shipmentId/approve-reject-policy-image",
//   shipmentController.adminApproveRejectPolicyImage
// );

// router.put(
//   "/shipment/:shipmentId/inspection/admin",
//   auth(roles.Admin),
//   shipmentController.addInspectionStatus
// );

// router.put(
//   "/shipment/:shipmentId/inspection",
//   auth(roles.Driver),
//   shipmentController.updateUserInspectionStatus
// );

export default router;
