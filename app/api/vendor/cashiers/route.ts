import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

connectDB(); // Ensure database is connected

// Type definition for request payloads
interface CashierRequest {
  name?: string;
  email?: string;
  password?: string;
  cashierId?: string;
}

/**
 * GET: Fetch all cashiers for the logged-in vendor
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // if (!session?.user || session.user.role !== "vendor") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    if (!session?.user?.vendorId || typeof session.user.vendorId !== "string") {
      return NextResponse.json({ error: "Invalid Vendor ID" }, { status: 400 });
    }

    const vendorId = session.user.vendorId as string;
    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json({ error: "Invalid Vendor ID" }, { status: 400 });
    }

    const cashiers = await Cashier.find({ vendorId });
    return NextResponse.json({ cashiers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cashiers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Create a new cashier under the vendor
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password }: CashierRequest = await req.json();
    const vendorId = session.user.vendorId as string;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!vendorId || typeof vendorId !== "string") {
      return NextResponse.json({ error: "Invalid Vendor ID" }, { status: 400 });
    }

    const existingCashier = await Cashier.findOne({ email });
    if (existingCashier) {
      return NextResponse.json({ error: "Cashier already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCashier = new Cashier({ name, email, password: hashedPassword, vendorId });

    await newCashier.save();
    return NextResponse.json({ message: "Cashier created successfully", cashier: newCashier }, { status: 201 });
  } catch (error) {
    console.error("Error creating cashier:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH: Update cashier details
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cashierId, name, email, password }: CashierRequest = await req.json();

    if (!cashierId || !mongoose.Types.ObjectId.isValid(cashierId)) {
      return NextResponse.json({ error: "Invalid Cashier ID" }, { status: 400 });
    }

    const updateData: Partial<CashierRequest> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedCashier = await Cashier.findByIdAndUpdate(cashierId, updateData, { new: true });
    if (!updatedCashier) {
      return NextResponse.json({ error: "Cashier not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cashier updated successfully", cashier: updatedCashier }, { status: 200 });
  } catch (error) {
    console.error("Error updating cashier:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE: Remove a cashier
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "vendor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cashierId }: CashierRequest = await req.json();

    if (!cashierId || !mongoose.Types.ObjectId.isValid(cashierId)) {
      return NextResponse.json({ error: "Invalid Cashier ID" }, { status: 400 });
    }

    const deletedCashier = await Cashier.findByIdAndDelete(cashierId);
    if (!deletedCashier) {
      return NextResponse.json({ error: "Cashier not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cashier deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting cashier:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
