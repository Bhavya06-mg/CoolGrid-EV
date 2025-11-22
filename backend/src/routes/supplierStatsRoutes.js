import express from "express";
import {
  getSupplierStats,
  updateSupplierPrice
} from "../controllers/supplierStatsController.js";

const router = express.Router();

router.get("/:supplierId", getSupplierStats);
router.put("/updatePrice/:supplierId", updateSupplierPrice);

export default router;
