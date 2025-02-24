import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "vendor" | "cashier" | "admin";
  vendorId?: string; // ✅ Cashiers must have a vendorId
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["vendor", "cashier", "admin"], required: true },
    vendorId: { type: String, required: function () { return this.role === "cashier"; } }, // ✅ Required only for cashiers
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
