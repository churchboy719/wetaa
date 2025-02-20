// src/models/Vendor.ts (Vendor Schema)
import mongoose, {Schema, model, models} from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

//export default mongoose.models.vendor || mongoose.model("vendor", VendorSchema);

const Vendor = models.Vendor || model("Vendor", VendorSchema);
export default Vendor;