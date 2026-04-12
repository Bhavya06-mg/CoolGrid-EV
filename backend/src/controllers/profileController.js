import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let user;
    if (role === "CUSTOMER") {
      user = await Customer.findById(userId);
    } else if (role === "SUPPLIER") {
      user = await Supplier.findById(userId);
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: "Error loading profile" });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updated = await Customer.findByIdAndUpdate(userId, updates, { new: true });

    res.json({ message: "Customer profile updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};

export const updateSupplierProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updated = await Supplier.findByIdAndUpdate(userId, updates, { new: true });

    res.json({ message: "Supplier profile updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Error updating profile" });
  }
};
