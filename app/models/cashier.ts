// // import mongoose from "mongoose";

// // const CashierSchema = new mongoose.Schema({
// //   name: { type: String, required: true },
// //   email: { type: String, required: true, unique: true },
// //   password: { type: String, required: true },
// //   role: { type: String, default: "cashier" }, // Default role
// //   active: { type: Boolean, default: true }, // Whether the cashier is active
// //   canPost: { type: Boolean, default: false }, // Whether posting is allowed
// //   vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, // Reference to Vendor
// // }, { timestamps: true });

// // export default mongoose.models.Cashier || mongoose.model("Cashier", CashierSchema);


// //"$2b$10$xWOZ8VkhgxXbgdr/h7ZY2e6O8kqzE7lqIvAqlMk4tcesW69oxZVfC"

// import mongoose, { Schema, Document } from "mongoose";

// export interface ICashier extends Document {
//   name: string;
//   email: string;
//   password: string;
//   vendorId: string;
// }

// const CashierSchema = new Schema<ICashier>({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true, select: false },
//   vendorId: { type: String, required: true }, // Ensuring each cashier is linked to a vendor
// });

// export default mongoose.models.Cashier || mongoose.model<ICashier>("Cashier", CashierSchema);

import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICashier extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  canPost: boolean;
  vendorId: Types.ObjectId; // Correctly typed as ObjectId
  createdAt?: Date;
  updatedAt?: Date;
}

const CashierSchema = new Schema<ICashier>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, default: "cashier" }, // Default role
    active: { type: Boolean, default: true }, // Whether the cashier is active
    canPost: { type: Boolean, default: false }, // Whether posting is allowed
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true }, // Correct ObjectId reference
  },
  { timestamps: true }
);

export default mongoose.models.Cashier || mongoose.model<ICashier>("Cashier", CashierSchema);
