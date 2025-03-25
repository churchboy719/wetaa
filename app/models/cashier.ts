import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICashier extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  canPost: boolean;
  vendorId: String; // Correctly typed as ObjectId
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
    vendorId: { type: String, required: true }, // Correct ObjectId reference
  },
  { timestamps: true }
);

export default mongoose.models.Cashier || mongoose.model<ICashier>("Cashier", CashierSchema);
