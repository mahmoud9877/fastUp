import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
  driverName: {
    type: String,
    required: true,
  },

  nationalId: {
    type: String, // ✅ تغييرها إلى String لتجنب مشاكل الأصفار
    required: true,
    unique: true,
  },

  truckNumber: {
    type: String,
    required: true,
  },

  phone: {
    type: String, // ✅ تغييرها إلى String لتجنب مشاكل التنسيق
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: "Driver",
  },
  comment: { type: String },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shipment" }],
});

// ✅ إصلاح `model is not defined`
const driverModel =
  mongoose.models.Driver || mongoose.model("Driver", driverSchema);

export default driverModel;
