import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: "SUPPLIER" },

    // Textual address (shown in UI)
    location: { type: String, required: true },

    renewable: { type: Boolean, required: true },
    pricePerUnit: { type: Number, required: true },
    availableUnits: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["AVAILABLE", "BUSY"], default: "AVAILABLE" },

    // ✅ Nested coordinate object (for map link)
    coordinates: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
    upiId: { type: String, required: false },

    isOnline: { type: Boolean, default: false}
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
