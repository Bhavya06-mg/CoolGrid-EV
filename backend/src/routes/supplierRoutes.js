// backend/routes/supplierRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getHistory,
  verifyOtpAndPayment,
  updateAvailability,
  viewRequests,
  acceptRequest,
  rejectRequest,
  getAllSuppliers,
} from "../controllers/supplierController.js";

import Request from "../models/Request.js"; // ✅ import Request model

const router = express.Router();

/* -------------------------------
   SUPPLIER CORE FUNCTIONAL ROUTES
--------------------------------- */

// ✅ Update availability (supplier can mark AVAILABLE/BUSY)
router.put("/availability", protect, updateAvailability);

// ✅ View all pending requests sent by customers
router.get("/requests", protect, viewRequests);

// ✅ Accept a specific customer request
router.put("/request/accept", protect, acceptRequest);

// ✅ Mark a request as completed (after payment verification)
router.put("/request/complete", protect, verifyOtpAndPayment);

// ✅ View supplier history of past transactions
router.get("/history", protect, getHistory);

// ✅ Get all suppliers (for customer search/filter)
router.get("/all", getAllSuppliers);

// ✅ Supplier Dashboard (accessible only to suppliers)
router.get("/dashboard", protect, (req, res) => {
  if (req.user.role !== "SUPPLIER") {
    return res.status(403).json({ message: "Access denied: Suppliers only" });
  }
  res.json({ message: `Welcome, supplier ${req.user.id}` });
});

/* -------------------------------
   SUPPLIER STATISTICS ROUTE
--------------------------------- */

// ✅ Supplier statistics for analytics page
router.get("/stats/:supplierId", protect, async (req, res) => {
  try {
    const supplierId = req.params.supplierId;

    // Find all completed requests of this supplier
    const completed = await Request.find({ supplierId, status: "COMPLETED" });

    // Basic statistics
    const totalRequests = completed.length;
    const totalUnitsSupplied = completed.reduce((sum, r) => sum + (r.units || 0), 0);
    const totalRevenue = completed.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    // ✅ Dynamic monthly revenue (based on MongoDB data)
    const monthlyData = await Request.aggregate([
      { $match: { supplierId, status: "COMPLETED" } },
      {
        $group: {
          _id: { $month: "$updatedAt" },
          revenue: { $sum: "$amountPaid" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    // Generate monthly arrays for the chart
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = new Array(12).fill(0);
    monthlyData.forEach((m) => {
      monthlyRevenue[m._id - 1] = m.revenue;
    });

    // Send stats to frontend
    res.json({
      totalRequests,
      totalUnitsSupplied,
      totalRevenue,
      months,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("❌ Error fetching supplier stats:", err);
    res.status(500).json({ message: "Failed to load supplier statistics" });
  }
});

export default router;
