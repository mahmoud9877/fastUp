import Shipment from "../../../DB/models/shipmentModel.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

export const addShipment = asyncHandler(async (req, res, next) => {
  try {
    const {
      startLocation,
      shipmentItems,
      endLocation,
      assignedDriver,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    console.log({ startLocation, shipmentItems, endLocation });

    if (!shipmentItems || shipmentItems.length === 0) {
      return res.status(400).json({ message: "No shipment items" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!startLocation || !endLocation || !shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "Missing required shipment details" });
    }

    const shipment = await Shipment.create({
      startLocation,
      shipmentItems,
      endLocation,
      assignedDriver,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: req.user._id, // ✅ Store user ID for tracking
    });

    res
      .status(201)
      .json({ message: "Shipment created successfully", shipment });
  } catch (error) {
    next(error); // ✅ Pass errors to global error handler
  }
});

export const editShipment = asyncHandler(async (req, res) => {
  try {
    const { shipmentId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      return res.status(400).json({ message: "Invalid shipment ID" });
    }

    // Find and update shipment
    const updatedShipment = await Shipment.findByIdAndUpdate(
      shipmentId,
      { $set: req.body }, // Update fields from req.body
      { new: true, runValidators: true }
    ).populate("assignedDriver"); // Populate driver details

    if (!updatedShipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res
      .status(200)
      .json({ message: "Shipment updated successfully", updatedShipment });
  } catch (error) {
    console.error("Error updating shipment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export const searchShipments = asyncHandler(async (req, res) => {
  try {
    let { query } = req.query;
    console.log("Received Search Query:", query);

    let results;
    if (!query || query.trim() === "") {
      // If no query is provided, return all shipments
      results = await Shipment.find().populate("assignedDriver");
    } else {
      query = String(query).trim(); // Trim whitespace

      results = await Shipment.find({
        $or: [
          { _id: query.match(/^[0-9a-fA-F]{24}$/) ? query : null }, // Match valid ObjectId
          { status: { $regex: new RegExp(query, "i") } }, // Search by status
          { startLocation: { $regex: new RegExp(query, "i") } }, // Search by start location
          { endLocation: { $regex: new RegExp(query, "i") } }, // Search by end location
        ],
      }).populate("assignedDriver");

      if (results.length === 0) {
        console.log("No matching shipments found, returning all shipments.");
        results = await Shipment.find().populate("assignedDriver");
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export const getShipmentById = asyncHandler(async (req, res) => {
  try {
    const { shipmentId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      return res.status(400).json({ message: "Invalid shipment ID format" });
    }

    // Find shipment and populate user details
    const shipment = await Shipment.findById(shipmentId).populate(
      "assignedDriver"
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    res.json(shipment);
  } catch (error) {
    console.error("Error in getShipmentById:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export const updateShipmentToDelivered = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);

  if (shipment) {
    shipment.isDelivered = true;
    shipment.deliveredAt = Date.now();

    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } else {
    res.status(404);
    throw new Error("Shipment not found");
  }
});

export const updatePolicyImage = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { policyImage } = req.body; // Assuming policy image is sent as a URL or base64 string

  // Validate input
  if (!policyImage) {
    return res.status(400).json({ message: "Policy image is required" });
  }

  // Find the shipment and update the policy image field
  const updatedShipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    { policyImage },
    { new: true, runValidators: true }
  );

  if (!updatedShipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  res.status(200).json({
    message: "Policy image updated successfully",
    updatedShipment,
  });
});
export const adminApproveRejectPolicyImage = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { status } = req.body; // "approved" or "rejected"

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const shipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    { policyImageStatus: status }, // Ensure your schema has this field
    { new: true }
  );

  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  res.status(200).json({
    message: `Policy image ${status} successfully`,
    shipment,
  });
});

export const getAllShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({}).populate("assignedDriver");
  return res.status(200).json(shipments);
});

export const addInspectionStatus = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { inspectionStatus, inspectionNotes } = req.body; // Example: "passed" or "failed"

  if (!["passed", "failed"].includes(inspectionStatus)) {
    return res.status(400).json({ message: "Invalid inspection status" });
  }

  const shipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    { inspectionStatus, inspectionNotes }, // Ensure your schema has these fields
    { new: true }
  );

  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  res.status(200).json({
    message: `Inspection marked as ${inspectionStatus}`,
    shipment,
  });
});

export const updateUserInspectionStatus = asyncHandler(async (req, res) => {
  const { shipmentId } = req.params;
  const { userInspectionStatus } = req.body; // Example: "pending" or "completed"

  if (!["pending", "completed"].includes(userInspectionStatus)) {
    return res.status(400).json({ message: "Invalid inspection status" });
  }

  const shipment = await Shipment.findByIdAndUpdate(
    shipmentId,
    { userInspectionStatus }, // Ensure your schema has this field
    { new: true }
  );

  if (!shipment) {
    return res.status(404).json({ message: "Shipment not found" });
  }

  res.status(200).json({
    message: `User inspection status updated to ${userInspectionStatus}`,
    shipment,
  });
});
