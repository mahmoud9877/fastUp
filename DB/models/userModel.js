import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  nationalId: {
    type: String,
    required: true,
    unique: true, // ✅ Ensure uniqueness in the database
    length: 14,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shipment" }], // Reference shipments
});

const User = mongoose.model("User", userSchema);

export default User;
