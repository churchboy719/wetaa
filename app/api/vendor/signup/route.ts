import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Vendor from "@/app/models/vendor";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { fullName, email, password, businessAddress, phone, packageType, voucherCode } = await req.json();

    const amountPaid = packageType === "Premium" ? 100 : 50; // Example pricing
    
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = new Vendor({
      fullName,
      email,
      password: hashedPassword,
      businessAddress,
      phone,
      packageType,
      amountPaid,
      voucherCode,
    });
    await newVendor.save();

    return NextResponse.json({ message: "Vendor registered successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
