import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    
    unitsRequested: { type: Number, required: true, min: 1 },
    
    status: {
      type: String,
      enum: [
        "PENDING",      // Created, waiting for supplier
        "ACCEPTED",     // Supplier accepted
        "VERIFIED",     // OTP verified
        "CHARGING",     // Charging started
        "CHARGING_COMPLETED",    // Charging completed
        "REJECTED",     // Rejected
        "PAID",         // Payment done (✅ new)
      ],
      default: "PENDING",
    },

    otp: { type: String, required: true },

    // ✅ Payment details (optional until payment done)
    payment: {
      mode: {
        type: String,
        enum: ["UPI", "CASH", null],
        default: null,
      },
      amountPaid: {
        type: Number,
        default: 0,
      },
      transactionId: {
        type: String,
        default: null,
      },
      paidAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
