import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";

export async function GET() {
  await connectDB();
  const cashiers = await Cashier.find({});
  return NextResponse.json({ cashiers });
}
