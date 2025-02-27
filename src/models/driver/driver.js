import driverModel from "../../../DB/models/driverModel.js";
import asyncHandler from "express-async-handler";
import { hash } from "../../utils/HashAndCompare.js";
import mongoose from "mongoose";

export const addDriver = asyncHandler(async (req, res) => {
  try {
    const { driverName, truckNumber, nationalId, password, phone, comment } =
      req.body;

    // Debug: Check if req.body contains correct data
    console.log("Received Data:", req.body);

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Check if National ID already exists
    const existingDriver = await driverModel.findOne({ nationalId });
    if (existingDriver) {
      return res.status(400).json({ message: "National ID is already used" });
    }

    console.log("Password before hashing:", password);

    const hashedPassword = await hash({ plaintext: password });

    const newDriver = await driverModel.create({
      driverName,
      truckNumber,
      nationalId,
      password: hashedPassword,
      phone,
      comment,
    });

    res.status(201).json({ message: "Driver added successfully", newDriver });
  } catch (error) {
    console.error("Error in addDriver:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export const searchDrivers = asyncHandler(async (req, res) => {
  try {
    let { query } = req.query;
    console.log("Received Query:", query);

    let results;
    if (!query || query.trim() === "") {
      // If no search query, return all drivers
      results = await driverModel.find({ role: "Driver" });
    } else {
      query = query.trim();
      results = await driverModel.find({
        $or: [
          { driverName: { $regex: new RegExp(query, "i") } },
          { truckNumber: { $regex: new RegExp(query, "i") } },
          { nationalId: { $regex: new RegExp(query, "i") } },
          { phone: { $regex: new RegExp(query, "i") } },
        ],
        role: "Driver", // Ensure only drivers are returned
      });

      if (results.length === 0) {
        console.log("No matching drivers found.");
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export const getDriverById = asyncHandler(async (req, res) => {
  try {
    const { driverId } = req.params;

    // ✅ التحقق من صحة `driverId`
    if (!mongoose.isValidObjectId(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID format" });
    }

    // ✅ البحث عن السائق في `driverModel` بدلاً من `User`
    const driver = await driverModel.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.status(200).json({ driver });
  } catch (error) {
    console.error("Error fetching driver:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export const editProfile = asyncHandler(async (req, res, next) => {
  try {
    const { DriverName, TruckNo, IDNo, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new asyncHandler("User not found.", 404));
    }

    if (DriverName) user.DriverName = DriverName;
    if (TruckNo) user.TruckNo = TruckNo;
    if (phone) user.phone = phone;
    if (IDNo) user.IDNo = IDNo;

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Profile updated successfully.", user, token });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export const getAllDrivers = asyncHandler(async (req, res) => {
  try {
    const drivers = await driverModel.find().populate("shipments");

    if (drivers.length === 0) {
      return res.status(404).json({ message: "No drivers found." });
    }

    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export const deleteDriver = asyncHandler(async (req, res) => {
  try {
    const { driverId } = req.params;
    const adminId = req.user?.id;

    console.log(`Admin (${adminId}) attempting to delete Driver (${driverId})`);

    // ✅ التحقق من صحة `driverId`
    if (!mongoose.isValidObjectId(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID format" });
    }

    // ✅ البحث عن السائق في `driverModel`
    const driver = await driverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // ✅ التحقق من أن المشرف لا يحاول حذف نفسه
    if (driver._id.toString() === adminId) {
      return res
        .status(403)
        .json({ message: "Admins cannot delete themselves." });
    }

    // ✅ حذف السائق
    await driverModel.findByIdAndDelete(driverId);
    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Delete Driver Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
export const updateDriver = asyncHandler(async (req, res) => {
  try {
    const { driverId } = req.params;
    const {
      driverName,
      truckNumber,
      nationalId,
      password,
      phone,
      comment,
      role,
    } = req.body;
    const adminId = req.user?.id;

    console.log(`Admin (${adminId}) updating Driver (${driverId})`);

    // التحقق من أن driverId هو ObjectId صالح
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    let driver = await driverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // منع المشرفين من تغيير دورهم بأنفسهم
    if (role !== undefined && req.user.id === driver._id.toString()) {
      return res
        .status(403)
        .json({ message: "Admins cannot change their own role." });
    }

    // تحديث البيانات فقط إذا تم إرسال قيم جديدة
    driver.driverName = driverName || driver.driverName;
    driver.truckNumber = truckNumber || driver.truckNumber;
    driver.nationalId = nationalId || driver.nationalId;
    driver.phone = phone || driver.phone;
    driver.comment = comment || driver.comment;

    // تحديث كلمة المرور مع التحقق من التجزئة
    if (password) {
      driver.password = await hash(password, 10);
    }

    // تحديث الدور في حالة وجوده
    if (role !== undefined) {
      driver.role = role;
    }

    await driver.save();
    res.status(200).json({ message: "Driver updated successfully", driver });
  } catch (error) {
    console.error("Update Driver Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
