import mongoose from "mongoose";
import { AREAS } from "../constants/AREAS.js";

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

  
     area: {
        type: String,
        required: true,
        enum: Object.keys(AREAS)
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
