import User from "../../../DB/models/userModel.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../../utils/GenerateAndVerifyToken.js";
import { hash, compare } from "../../utils/HashAndCompare.js";
import { generateCode, sendSMS } from "../../utils/OTP.js";

export const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { phone, nationalId, password } = req.body;
    console.log({ nationalId, password });
    const checkAdmin = await User.findOne({ phone });
    if (checkAdmin) {
      return res.status(400).json({ message: "Phone already exists" });
    }
    const hashPassword = await hash({ plaintext: password });

    const createUser = await User.create({
      phone,
      nationalId,
      password: hashPassword,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", createUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

export const getAllAdmins = asyncHandler(async (req, res) => {
  const getAllAdmin = await User.find();
  return res.json({ message: "Done", getAllAdmin });
});

export const login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  console.log("Received phone:", phone);

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  // Find user and explicitly select password
  const user = await User.findOne({ phone }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "Invalid phone" });
  }

  console.log("Stored hashed password:", user.password);

  // Compare passwords (assuming compare() is async)
  const isMatch = await compare({
    plaintext: password,
    hashValue: user.password,
  });
  console.log("Password match result:", isMatch);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  // Ensure token signature is set
  if (!process.env.TOKEN_SIGNATURE) {
    console.error("TOKEN_SIGNATURE is missing from environment variables");
    return res.status(500).json({ message: "Internal server error" });
  }
  if (!user._id || !user.role) {
    return res.status(500).json({ message: "User data is incomplete" });
  }

  // Generate token
  const token = generateToken({ payload: { id: user._id, role: user.role } });

  return res.status(200).json({ message: "Login successful", token });
});

export const changePassword = asyncHandler(async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // ✅ التحقق من إدخال البيانات
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required." });
    }

    // ✅ جلب المستخدم
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ مقارنة كلمة المرور القديمة بالمخزنة
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }

    // ✅ تشفير كلمة المرور الجديدة
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ حفظ كلمة المرور الجديدة
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Temporary OTP store (Use Redis in production)
const otpStore = new Map();

// ✅ 1️⃣ Send OTP Code
export const sendResetCode = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  // Validate phone
  const phoneSchema = Joi.object({
    phone: Joi.string()
      .pattern(new RegExp(/^(\+?\d{10,15})$/))
      .required(),
  });

  const { error } = phoneSchema.validate({ phone });
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Check if user exists
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate OTP
  const otpCode = generateCode();
  otpStore.set(phone, otpCode); // Store OTP

  // Send OTP via SMS
  await sendSMS(phone, `Your password reset code is: ${otpCode}`);

  res.status(200).json({ message: "Reset code sent successfully" });
});

// ✅ 2️⃣ Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { phone, code, password, cPassword } = req.body;

  // Validate input
  const schema = Joi.object({
    phone: Joi.string()
      .pattern(new RegExp(/^(\+?\d{10,15})$/))
      .required(),
    code: Joi.string()
      .pattern(new RegExp(/^\d{4}$/))
      .required(),
    password: Joi.string().min(6).max(30).required(),
    cPassword: Joi.string().valid(Joi.ref("password")).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Verify OTP
  if (otpStore.get(phone) !== code) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  // Hash new password
  const hashedPassword = hash({ plaintext: password });

  // Update password
  await User.findOneAndUpdate({ phone }, { password: hashedPassword });

  // Clear OTP
  otpStore.delete(phone);

  res.status(200).json({ message: "Password reset successfully" });
});
