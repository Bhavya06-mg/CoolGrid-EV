import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },

    role: { type: String, default: "SUPPLIER" },

    renewable: { type: Boolean, required: true },
    pricePerUnit: { type: Number, required: true },
    availableUnits: { type: Number, required: true },

    // Short locality shown on cards / filters (kept for existing code that reads `area`)
    area: { type: String, required: true, trim: true },

    // Exact address entered at registration
    address: {
      line1: { type: String, trim: true },      // building / street
      landmark: { type: String, trim: true },
      area: { type: String, trim: true },       // locality
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      formatted: { type: String, trim: true }   // single-line version for display
    },
        // 🔥 REQUIRED NOW — makes sorting work
    coordinates: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    },

    isOnline: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Supplier", supplierSchema);
