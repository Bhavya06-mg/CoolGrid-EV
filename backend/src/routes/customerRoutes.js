import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {getHistory, searchSuppliers, sendRequest } from "../controllers/customerController.js";
import Supplier from "../models/Supplier.js";

const router = express.Router();


// Search suppliers
router.post("/search", protect, searchSuppliers);

router.post("/request", protect, sendRequest);

router.get("/history", protect, getHistory);



router.get("/dashboard", protect, async (req, res) => {
  if (req.user.role !== "CUSTOMER") {
    return res.status(403).json({ message: "Access denied: Customers only" });
  }

  try {
    const suppliers = await Supplier.find().select("-password -phone"); 
    res.json({
      message: `Welcome, customer ${req.user.id}`,
      suppliers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

router.post("/book/:supplierId", protect, async (req, res) => {
  if (req.user.role !== "CUSTOMER") {
    return res.status(403).json({ message: "Access denied: Customers only" });
  }

  try {
    const supplier = await Supplier.findById(req.params.supplierId).select("-password");
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    // Normally, you'd also save a booking record here in DB
    res.json({
      message: "Booking successful",
      supplierContact: {
        name: supplier.name,
        phone: supplier.phone, // Now revealed
        location: supplier.location,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});





export default router;
