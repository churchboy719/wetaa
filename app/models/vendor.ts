// // src/models/Vendor.ts (Vendor Schema)
// //import mongoose, {Schema, model, models} from "mongoose";
// import mongoose from "mongoose";
// import { nanoid } from "nanoid"; // Generates unique vendorId

// const vendorSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   businessName: { type: String, required: true },
//   address: { type: String, required: true },
//   businessType: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   phone: { type: String, required: true },
//   vendorId: { type: String, unique: true, default: () => nanoid(10) }, // Auto-generate vendorId
//   packageType: { type: String, required: true },
//   voucherCode: { type: String, default: null }
// });

// const Vendor = mongoose.model("Vendor", vendorSchema);
// export default Vendor;


// // import mongoose, { Schema, Document } from "mongoose";

// // export interface IVendor extends Document {
// //   name: string;
// //   email: string;
// //   password: string;
// //   vendorId: string;
// //   createdAt: Date;
// //   updatedAt: Date;
// // }

// // const VendorSchema = new Schema<IVendor>(
// //   {
// //     name: { type: String, required: true },
// //     email: { type: String, required: true, unique: true },
// //     password: { type: String, required: true, select: false }, // Hashing should be done before saving
// //     vendorId: { type: String, required: true, unique: true }, // ✅ Ensuring each vendor has a unique ID
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);

import mongoose, { Schema, Document, Model } from "mongoose";
import { nanoid } from "nanoid";

// Define interface for TypeScript
export interface IVendor extends Document {
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
}

// Check if model already exists
const VendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  address: { type: String, required: true },
  businessType: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  vendorId: { type: String, unique: true, default: () => nanoid(10) }, // Auto-generate vendorId
  packageType: { type: String, required: true },
  voucherCode: { type: String, default: null }
});

// Prevent model overwrite error
const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);

export default Vendor;
