// /app/api/payment/initialize/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import Payment from '@/app/models/payment';
import { connectDB } from '@/app/lib/mongodb';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, amount, packageType, vendorId } = await req.json();

    if (!email || !amount || !packageType || !vendorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const paystackAmount = amount * 100; // Convert to kobo

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: paystackAmount,
        metadata: { packageType, vendorId },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // Save payment to database
    const payment = new Payment({
      vendorId,
      amount,
      reference,
      status: 'pending',
      paymentMethod: 'Paystack',
    });
    await payment.save();

    return NextResponse.json({ url: authorization_url, reference }, { status: 200 });
  } catch (error: any) {
    console.error('Payment Initialization Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
  }
}
