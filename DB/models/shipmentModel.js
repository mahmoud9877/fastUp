import { mongoose } from "mongoose";

const shipmentSchema = new mongoose.Schema({
  shipmentItems: [{ type: Object, required: true }],
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  status: { type: String, default: "Pending" },
  policyImage: { type: String },
  policyImageStatus: {
    type: String,
    enum: ["approved", "rejected"],
    default: "pending",
  },
  inspectionStatus: {
    type: String,
    enum: ["passed", "failed"],
    default: "pending",
  },
  comment: { type: String },

  inspectionNotes: { type: String },
  userInspectionStatus: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

const Shipment = mongoose.model("Shipment", shipmentSchema);
export default Shipment;
