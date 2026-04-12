// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import { AREAS } from "../constants/AREAS.js";

// -------------------------------------------
// GENERATE JWT TOKEN
// -------------------------------------------
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

// -------------------------------------------
// CUSTOMER REGISTRATION
// -------------------------------------------
export const registerCustomer = async (req, res) => {
  try {
    const { username, password, name, phone, vehicleId } = req.body;

    const existing = await Customer.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      username,
      password: hashedPassword,
      name,
      phone,
      vehicleId,
      location: { lat: 0, lng: 0 }, // default
    });

    await customer.save();

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// -------------------------------------------
// SUPPLIER REGISTRATION
// -------------------------------------------
export const registerSupplier = async (req, res) => {
  try {
    const { username, password, name, phone, area, renewable, pricePerUnit, availableUnits } = req.body;

    // Validate area
    const areaCoordinates = AREAS[area];
    if (!areaCoordinates) {
      return res.status(400).json({ message: "Invalid area selected" });
    }

    // Check existing user
    const existing = await Supplier.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supplier = new Supplier({
      username,
      password: hashedPassword,
      name,
      phone,
      area,
      renewable,
      pricePerUnit,
      availableUnits,
      status: "AVAILABLE",
      coordinates: areaCoordinates   // ✔ IMPORTANT
    });

    await supplier.save();

    res.status(201).json({ message: "Supplier registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// -------------------------------------------
// LOGIN (SUPPLIER / CUSTOMER)
// -------------------------------------------
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    let user;

    if (role === "CUSTOMER") user = await Customer.findOne({ username });
    else if (role === "SUPPLIER") user = await Supplier.findOne({ username });
    else return res.status(400).json({ message: "Invalid role" });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Supplier → online
    if (role === "SUPPLIER") {
      user.isOnline = true;
      user.status = "AVAILABLE"; // can supply energy
      await user.save();
    }

    const token = generateToken(user._id, role);

    res.json({
      token,
      role,
      username: user.username,
      userId: user._id,
      message: `${role} logged in successfully`,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// -------------------------------------------
// LOGOUT
// -------------------------------------------
export const logout = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (role === "SUPPLIER") {
      await Supplier.findByIdAndUpdate(userId, {
        isOnline: false,
        status: "UNAVAILABLE",
      });
    } else if (role === "CUSTOMER") {
      await Customer.findByIdAndUpdate(userId, { isOnline: false });
    }

    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error logging out" });
  }
};

// -------------------------------------------
// CHANGE PASSWORD
// -------------------------------------------
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password required" });

    const hashed = await bcrypt.hash(newPassword, 10);

    let user =
      (await Customer.findByIdAndUpdate(userId, { password: hashed })) ||
      (await Supplier.findByIdAndUpdate(userId, { password: hashed }));

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating password" });
  }
};

// -------------------------------------------
// UPDATE LOCATION (GPS AUTO)
// -------------------------------------------
export const updateLocation = async (req, res) => {
  try {
    const { userId, role, lat, lng } = req.body;

    if (!lat || !lng)
      return res.status(400).json({ message: "Latitude & longitude required" });

    let user;
    if (role === "SUPPLIER")
      user = await Supplier.findByIdAndUpdate(
        userId,
        { location: { lat, lng } },
        { new: true }
      );
    else if (role === "CUSTOMER")
      user = await Customer.findByIdAndUpdate(
        userId,
        { location: { lat, lng } },
        { new: true }
      );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Location updated", location: user.location });
  } catch (err) {
    res.status(500).json({ message: "Error updating GPS", error: err.message });
  }
};
