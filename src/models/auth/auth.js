import User from "../../../DB/models/userModel.js";
import asyncHandler from "express-async-handler";
import { generateToken } from "../../utils/GenerateAndVerifyToken.js";
import { hash, compare } from "../../utils/HashAndCompare.js";

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
  console.log("Received password:", password);

  if (!phone || !password) {
    return res.status(400).json({ message: "Phone and password are required" });
  }

  const user = await User.findOne({ phone }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "Invalid phone" });
  }

  console.log("Stored password:", user.password);

  const isMatch = compare({ plaintext: password, hashValue: user.password });
  console.log("Password match result:", isMatch);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  const token = generateToken({ id: user._id, role: user.role });

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
