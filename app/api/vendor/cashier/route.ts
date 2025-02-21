// src/app/api/vendor/cashiers/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, vendorId } = await req.json();

    const existingCashier = await Cashier.findOne({ email });
    if (existingCashier) {
      return NextResponse.json({ error: "Cashier already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCashier = new Cashier({
      name,
      email,
      password: hashedPassword,
      vendorId,
      active: true,
      canPost: false,
    });

    await newCashier.save();
    return NextResponse.json({ message: "Cashier added successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
