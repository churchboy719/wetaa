import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";
import bcrypt from "bcryptjs";

// ✅ Create a new cashier (POST)
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, vendorId } = await req.json();

    // Validate request
    if (!name || !email || !password || !vendorId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check for duplicate email
    const existingCashier = await Cashier.findOne({ email });
    if (existingCashier) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCashier = new Cashier({ name, email, password: hashedPassword, vendorId });

    // Save to DB
    await newCashier.save();
    return NextResponse.json({ message: "Cashier created successfully", cashier: newCashier }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating cashier:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Get all cashiers for a vendor (GET)
export async function GET(req: Request) {
  try {
    await connectDB();
    
    // Extract vendorId from query params
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    const cashiers = await Cashier.find({ vendorId });
    return NextResponse.json({ cashiers }, { status: 200 });

  } catch (error: any) {
    console.error("Error fetching cashiers:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Delete a cashier (DELETE)
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { cashierId, vendorId } = await req.json();

    if (!cashierId || !vendorId) {
      return NextResponse.json({ error: "Cashier ID and Vendor ID are required" }, { status: 400 });
    }

    // Ensure cashier belongs to the vendor
    const cashier = await Cashier.findOneAndDelete({ _id: cashierId, vendorId });
    if (!cashier) {
      return NextResponse.json({ error: "Cashier not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cashier deleted successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("Error deleting cashier:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ✅ Toggle `active` or `canPost` status (PATCH)
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { cashierId, vendorId, updateField, value } = await req.json();

    if (!cashierId || !vendorId || !updateField) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure cashier belongs to the vendor
    const updatedCashier = await Cashier.findOneAndUpdate(
      { _id: cashierId, vendorId },
      { [updateField]: value },
      { new: true }
    );

    if (!updatedCashier) {
      return NextResponse.json({ error: "Cashier not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cashier updated successfully", cashier: updatedCashier }, { status: 200 });

  } catch (error: any) {
    console.error("Error updating cashier:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
