import Request from "../models/Request.js";
import Customer from "../models/Customer.js";
import Supplier from "../models/Supplier.js";
import { io } from "../../server.js";
import { updateStatsAfterTransaction } from "./supplierStatsController.js";

// Generate OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// 🧍‍♀️ Customer creates a new request
export const createRequest = async (req, res) => {
  try {
    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({ message: "Please login as customer" });
    }

    const { customerId, supplierId, unitsRequested } = req.body;

    const customer = await Customer.findById(customerId);
    const supplier = await Supplier.findById(supplierId);

    if (!customer || !supplier)
      return res.status(404).json({ message: "Customer or Supplier not found" });

    // ✅ Check supplier availability instead of old request statuses
    if (supplier.status === "BUSY") {
      return res.status(400).json({
        message: "Supplier is currently busy. Please try again later.",
      });
    }

    // Create request
    const newRequest = new Request({
      customer: customer._id,
      supplier: supplier._id,
      unitsRequested,
      otp: generateOTP(),
      status: "PENDING",
    });

    await newRequest.save();

    // Emit to supplier
    io.to(supplierId.toString()).emit("newChargingRequest", {
      _id: newRequest._id,
      customerName: customer.name,
      unitsNeeded: unitsRequested,
      distance: Math.random() * 10, // mock for now
    });

    res.status(201).json({
      message: "Request created successfully",
      request: newRequest,
    });
  } catch (err) {
    console.error("❌ Error creating request:", err);
    res.status(500).json({ message: "Server error creating request" });
  }
};

// ✅ Supplier accepts a request
export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId)
      .populate("supplier", "name phone location coordinates")
      .populate("customer", "_id name phone email");

    if (!request) return res.status(404).json({ message: "Request not found" });

    // ✅ Mark supplier as BUSY
    const supplier = await Supplier.findById(request.supplier._id);
    if (supplier) {
      supplier.status = "BUSY";
      await supplier.save();
    }

    request.status = "ACCEPTED";
    await request.save();

    // Notify customer
    io.to(request.customer._id.toString()).emit("requestAccepted", {
      otp: request.otp,
      supplier: {
        name: request.supplier.name,
        phone: request.supplier.phone,
        address: request.supplier.location,
        lat: request.supplier.coordinates?.lat,
        lng: request.supplier.coordinates?.lng,
      },
      message: "Your request was accepted! Here is your OTP and supplier location.",
    });

    res.json({ message: "Request accepted and sent to customer", request });
  } catch (err) {
    console.error("❌ Error accepting request:", err);
    res.status(500).json({ message: "Error accepting request" });
  }
};

// ❌ Supplier rejects a request
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "REJECTED";
    await request.save();

    io.to(request.customer.toString()).emit("requestRejected", request);
    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("❌ Error rejecting request:", err);
    res.status(500).json({ message: "Error rejecting request" });
  }
};

export const getRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId)
      .populate("supplier", "name phone location")
      .populate("customer", "name phone email");

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json({ request });
  } catch (err) {
    console.error("❌ Error checking request status:", err);
    res.status(500).json({ message: "Error fetching request status" });
  }
};


// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { enteredOtp } = req.body;

    const request = await Request.findById(requestId)
      .populate("customer", "name phone")
      .populate("supplier", "name");

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.otp) == String(enteredOtp)) {
      request.status = "VERIFIED";
      await request.save();

      io.to(request.customer._id.toString()).emit("otpVerified", {
        message: "OTP verified successfully!",
      });

      res.json({ success: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

export const updateCustomerLocation = async (req, res) => { try { const { customerId } = req.body; const { lat, lng } = req.body; const customer = await Customer.findById(customerId); if (!customer) return res.status(404).json({ message: "Customer not found" }); customer.coordinates = { lat, lng }; await customer.save(); res.json({ message: "Customer location updated" }); } catch (err) { console.error("❌ Error updating customer location:", err); res.status(500).json({ message: "Error updating location" }); } };

// ✅ Start charging
export const startCharging = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId).populate("customer", "_id");

    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "CHARGING";
    await request.save();

    io.to(request.customer._id.toString()).emit("chargingStarted", {
      message: "⚡ Charging started at supplier station.",
    });

    res.json({ success: true, message: "Charging started successfully" });
  } catch (err) {
    console.error("❌ Error starting charging:", err);
    res.status(500).json({ message: "Error starting charging" });
  }
};
export const completeCharging = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate("customer")
      .populate("supplier");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "CHARGING_COMPLETED";
    await request.save();

    const customer = request.customer;
    const supplier = request.supplier;


    const units = Number(request.unitsRequested);

    supplier.availableUnits = Math.max(0, supplier.availableUnits - units);
    await supplier.save();
    
    const totalCost = units * Number(supplier.pricePerUnit);

    // Notify customer
    io.to(customer._id.toString()).emit("chargingCompleted", {
      message: "Charging completed. Please proceed to payment.",
      chargedUnits: units,
      totalCost,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        phone: supplier.phone,
        upiId: supplier.upiId || "supplier@upi",
      },
    });

    return res.json({
      success: true,
      message: "Charging completed successfully",
      chargedUnits: units,
      totalCost,
      paymentMode: request.payment?.mode || "CASH",
    });

  } catch (err) {
    console.error("❌ Error completing charging:", err);
    return res.status(500).json({ message: "Error completing charging" });
  }
};


export const markPaymentDone = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { mode, amountPaid, transactionId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "PAID";
    request.payment = {
      mode,
      amountPaid,
      transactionId,
      paidAt: new Date(),
    };

    await request.save();

    // notify customer
    io.to(request.customer.toString()).emit("paymentConfirmed", {
      message: "Supplier confirmed your payment.",
    });

    return res.json({ message: "Payment confirmed successfully", request });

  } catch (err) {
    console.error("❌ Error marking payment:", err);
    return res.status(500).json({ message: "Error confirming payment" });
  }
};
