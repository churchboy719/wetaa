// /app/api/payment/verify/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import Payment from '@/app/models/payment';
import { connectDB } from '@/app/lib/mongodb';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Payment reference missing' }, { status: 400 });
    }

    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify Payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { data } = response.data;

    if (data.status === 'success') {
      payment.status = 'success';
      await payment.save();
      return NextResponse.json({ message: 'Payment successful', payment });
    } else {
      payment.status = 'failed';
      await payment.save();
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment Verification Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
