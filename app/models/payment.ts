import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  vendorId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  reference: string;
  paymentMethod: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  vendorId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  reference: { type: String, required: true, unique: true },
  paymentMethod: { type: String, default: 'Paystack' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
