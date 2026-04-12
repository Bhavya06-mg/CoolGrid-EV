import mongoose from "mongoose";

const supplierStatsSchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    totalRequests: { type: Number, default: 0 },
    totalUnitsSupplied: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const SupplierStats = mongoose.model("SupplierStats", supplierStatsSchema);
export default SupplierStats;
