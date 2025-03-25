import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "vendor" | "cashier" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["vendor", "cashier", "admin"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", UserSchema);
