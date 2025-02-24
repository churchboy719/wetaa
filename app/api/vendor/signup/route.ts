import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Vendor from "@/app/models/vendor";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, businessName, address, businessType, email, password, phone, packageType, voucherCode } = await req.json();

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 400 });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new vendor (vendorId is auto-generated)
    const newVendor = new Vendor({
      name,
      businessName,
      address,
      businessType,
      email,
      password: hashedPassword,
      phone,
      packageType,
      voucherCode,
    });

    await newVendor.save();

    return NextResponse.json({ message: "Vendor created successfully", vendor: newVendor }, { status: 201 });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
