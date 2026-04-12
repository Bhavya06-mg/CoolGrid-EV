import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalUnits: { type: Number, default: 0 },
    name: String,
    phone: String,
    vehicleId: String,

    // 🧾 History of all requests made by the customer
    history: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Request", // reference to the Request model
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
