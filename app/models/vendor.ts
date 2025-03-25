import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { nanoid } from "nanoid";


export interface IVendor extends Document {
  _id: Types.ObjectId; // ✅ Add _id here
  name: string;
  businessName: string;
  address: string;
  businessType: string;
  email: string;
  password: string;
  phone: string;
  vendorId: string;
  packageType: string;
  voucherCode?: string | null;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  isActive: boolean;
  role: "vendor"; 
}


// Schema definition
const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  address: { type: String, required: true },
  businessType: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  vendorId: { type: String, unique: true, default: () => nanoid(10) }, 
  packageType: {
    type: String,
    enum: [
      "bronze_monthly",
      "bronze_yearly",
      "silver_monthly",
      "silver_yearly",
      "gold_monthly",
      "gold_yearly",
      "trial_24hours"
    ],
    required: true,
  },
  voucherCode: { type: String, default: null },
  subscriptionStart: { type: Date, default: Date.now },
  subscriptionEnd: { type: Date },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ["vendor"], default: "vendor" }, // Added role
});

// Middleware to set subscription end date
VendorSchema.pre('save', function (next) {
  const vendor = this as IVendor;
  
  // Set end date based on subscription type
  const now = vendor.subscriptionStart || new Date();

  switch (vendor.packageType) {
    case "bronze_monthly":
    case "silver_monthly":
    case "gold_monthly":
      vendor.subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      break;
    case "bronze_yearly":
    case "silver_yearly":
    case "gold_yearly":
      vendor.subscriptionEnd = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 days
      break;
    case "trial_24hours":
      vendor.subscriptionEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      break;
  }

  next();
});

// Prevent model overwrite error
const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);

export default Vendor;
