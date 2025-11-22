import express from "express";
import { updateCustomerProfile, updateSupplierProfile, getProfile } from "../controllers/profileController.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

// GET Profile (Auto-detect customer or supplier)
router.get("/profile", protect, getProfile);

// UPDATE Customer
router.put("/customer/update", protect, updateCustomerProfile);

// UPDATE Supplier
router.put("/supplier/update", protect, updateSupplierProfile);

export default router;
