import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import Cashier from "@/app/models/cashier";
import { getServerSession } from "next-auth";
import authOptions from "@/app/lib/authOptions";
import mongoose from "mongoose";


export async function PATCH(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user || session.user.role !== "vendor") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const { canPostSales } = await req.json();
      const { searchParams } = new URL(req.url); // ✅ Get query params
      const id = searchParams.get("id"); // ✅ Correct way to get 'id'
  
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid Cashier ID" }, { status: 400 });
      }
  
      const updatedCashier = await Cashier.findByIdAndUpdate(id, { canPostSales }, { new: true });
  
      if (!updatedCashier) {
        return NextResponse.json({ error: "Cashier not found" }, { status: 404 });
      }
  
      return NextResponse.json({ 
        message: "Cashier permission updated", 
        canPostSales: updatedCashier.canPostSales 
      }, { status: 200 });
  
    } catch (error) {
      console.error("Error updating cashier permissions:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  