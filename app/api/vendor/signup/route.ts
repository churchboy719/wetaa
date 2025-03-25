import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Vendor, { IVendor } from "@/app/models/vendor";
import { Types } from "mongoose";

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

    // Create new vendor
    const newVendor: IVendor = new Vendor({
      name,
      businessName,
      address,
      businessType,
      email,
      password: hashedPassword,
      phone,
      packageType,
      voucherCode,
      //vendorId: new Types.ObjectId(), // Ensure vendorId is set
      role: "vendor", 
    });

    await newVendor.save();

    return NextResponse.json({
      message: "Vendor created successfully",
      vendor: { 
        id: (newVendor._id as Types.ObjectId).toString(),
        name: newVendor.name,
        email: newVendor.email,
        vendorId: newVendor.vendorId,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating vendor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
