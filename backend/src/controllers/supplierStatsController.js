import Supplier from "../models/Supplier.js";
import SupplierStats from "../models/SupplierStats.js";

// 🟢 Fetch supplier stats
export const getSupplierStats = async (req, res) => {
  try {
    const { supplierId } = req.params;

    let stats = await SupplierStats.findOne({ supplierId });
    if (!stats) {
      stats = await SupplierStats.create({ supplierId });
    }

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
};

// 🟢 Update supplier price
export const updateSupplierPrice = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { newPrice } = req.body;

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.pricePerUnit = newPrice;
    await supplier.save();

    res.status(200).json({ message: "Price updated successfully", supplier });
  } catch (error) {
    res.status(500).json({ message: "Error updating price", error });
  }
};

// 🟢 Update stats when supplier completes a transaction
export const updateStatsAfterTransaction = async (supplierId, units, revenue) => {
  const stats = await SupplierStats.findOne({ supplierId });
  if (stats) {
    stats.totalRequests += 1;
    stats.totalUnitsSupplied += units;
    stats.totalRevenue += revenue;
    stats.lastUpdated = Date.now();
    await stats.save();
  } else {
    await SupplierStats.create({
      supplierId,
      totalRequests: 1,
      totalUnitsSupplied: units,
      totalRevenue: revenue
    });
  }
};
