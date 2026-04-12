import Supplier from "../models/Supplier.js";
import Request from "../models/Request.js"
import { getDistance } from "../utils/haversine.js";
// Search suppliers who have enough units

export const searchSuppliers = async (req, res) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Access denied: Customers only" });
    }

    const { unitsNeeded, customerLat, customerLng } = req.body;

    if (!unitsNeeded || !customerLat || !customerLng) {
      return res.status(400).json({ message: "Please provide unitsNeeded, customerLat, customerLng" });
    }

    let suppliers = await Supplier.find({
      availableUnits: { $gte: unitsNeeded },
      status: "AVAILABLE"
    });

    // Calculate distance to each supplier
    suppliers = suppliers.map(s => {
      const distance = getDistance(customerLat, customerLng, s.coordinates.lat, s.coordinates.lng);
      return { ...s._doc, distance };
    });

    // Sort by distance (closest first)
    suppliers.sort((a, b) => a.distance - b.distance);

    if (suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers available nearby" });
    }

    res.json({ message: "Suppliers found", suppliers });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Customer sends request
export const sendRequest = async (req, res) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Access denied: Customers only" });
    }

    const { supplierId, unitsRequested } = req.body;

    if (!supplierId || !unitsRequested) {
      return res.status(400).json({ message: "Please provide supplierId and unitsRequested" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const request = await Request.create({
      customer: req.user.id,
      supplier: supplierId,
      unitsRequested,
      otp
    });

    res.json({ message: "Request sent successfully", requestId: request._id, otp });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get customer's request history
export const getHistory = async (req, res) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Access denied: Customers only" });
    }

    const history = await Request.find({ customer: req.user.id })
      .populate("supplier", "name location")
      .sort({ createdAt: -1 });

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


