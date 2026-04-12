import Supplier from "../models/Supplier.js";
import Request from "../models/Request.js";

// Update supplier availability
export const updateAvailability = async (req, res) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return res.status(403).json({ message: "Access denied: Suppliers only" });
    }

    const { availableUnits, location, status } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      req.user.id,
      { availableUnits, location, status },
      { new: true }
    );

    res.json({ message: "Availability updated", supplier });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// View pending requests
export const viewRequests = async (req, res) => {
  if (req.user.role !== "SUPPLIER") {
    return res.status(403).json({ message: "Access denied: Suppliers only" });
  }

  const requests = await Request.find({ supplier: req.user.id, status: "PENDING" })
    .populate("customer", "name email")
    .exec();

  res.json({ requests });
};

// Accept request
export const acceptRequest = async (req, res) => {
  if (req.user.role !== "SUPPLIER") {
    return res.status(403).json({ message: "Access denied: Suppliers only" });
  }

  const { requestId } = req.body;

  const request = await Request.findOneAndUpdate(
    { _id: requestId, supplier: req.user.id },
    { status: "ACCEPTED" },
    { new: true }
  );

  if (!request) return res.status(404).json({ message: "Request not found" });

  res.json({ message: "Request accepted", request });
};

// Reject request
export const rejectRequest = async (req, res) => {
  if (req.user.role !== "SUPPLIER") {
    return res.status(403).json({ message: "Access denied: Suppliers only" });
  }

  const { requestId } = req.body;

  const request = await Request.findOneAndUpdate(
    { _id: requestId, supplier: req.user.id },
    { status: "REJECTED" },
    { new: true }
  );

  if (!request) return res.status(404).json({ message: "Request not found" });

  res.json({ message: "Request rejected", request });
};

export const verifyOtpAndPayment = async (req, res) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return res.status(403).json({ message: "Access denied: Suppliers only" });
    }

    const { requestId, otp, amountPaid, transactionId } = req.body;

    if (!requestId || !otp || !amountPaid || !transactionId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const request = await Request.findOne({ _id: requestId, supplier: req.user.id });

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.otp !== otp) {
      return res.status(400).json({ message: "Wrong OTP" });
    }

    request.status = "COMPLETED";
    request.payment = { amountPaid, transactionId };
    await request.save();

    // Optionally, update supplier's availableUnits
    const supplier = await Supplier.findById(req.user.id);
    supplier.availableUnits -= request.unitsRequested;
    await supplier.save();

    res.json({ message: "Payment recorded and request completed", request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get supplier's request history
export const getHistory = async (req, res) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return res.status(403).json({ message: "Access denied: Suppliers only" });
    }

    const history = await Request.find({ supplier: req.user.id })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().select("-password"); // don't send password
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};