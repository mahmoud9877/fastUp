import express from "express";
import { auth, roles } from "../../middleware/authMiddleware.js";
import * as shipmentController from "./shipment.js";
import upload from "../../utils/multer.js";

const router = express.Router();

// Ensure only Admins can add a shipment
router.post("/add_shipment", auth(roles.Admin), shipmentController.addShipment);

// Edit shipment (Admin Only)
router.put(
  "/edit_shipment/:shipmentId",
  auth(roles.Admin),
  shipmentController.editShipment
);

// Get all shipments ((Admin Only))
router.get(
  "/all_shipments",
  // auth(roles.Admin),
  shipmentController.getAllShipments
);

// Get shipment by ID ((Admin Only))
router.get(
  "/:shipmentId",
  auth(roles.Admin),
  shipmentController.getShipmentById
);

// Search shipments ((Admin Only))
router.get(
  "/search_shipments",
  auth(roles.Admin),
  shipmentController.searchShipments
);

// Upload a policy image (Requires Multer)
router.put(
  "/addPolicy/:shipmentId",
  upload.single("policyImage"),
  shipmentController.updatePolicyImage
);

// Approve/Reject Policy Image (Admin Only)
router.put(
  "/shipment/:shipmentId/approve-reject-policy-image",
  auth(roles.Admin),
  shipmentController.adminApproveRejectPolicyImage
);

// Admin: Add Inspection Status
router.put(
  "/shipment/:shipmentId/inspection/admin",
  auth(roles.Admin),
  shipmentController.addInspectionStatus
);

// Driver: Update Inspection Status
router.put(
  "/shipment/:shipmentId/inspection",
  auth(roles.Driver),
  shipmentController.updateUserInspectionStatus
);

export default router;
