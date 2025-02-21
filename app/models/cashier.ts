// src/app/models/cashier.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICashier extends Document {
  name: string;
  email: string;
  password: string;
  role: "cashier";
  active: boolean;
  canPost: boolean;
  vendorId: mongoose.Schema.Types.ObjectId;
}

const CashierSchema = new Schema<ICashier>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "cashier" },
  active: { type: Boolean, default: true },
  canPost: { type: Boolean, default: false },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
});

export default mongoose.models.Cashier || mongoose.model<ICashier>("Cashier", CashierSchema);
