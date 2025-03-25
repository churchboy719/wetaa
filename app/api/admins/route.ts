import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/lib/mongodb";
import { Types } from "mongoose";
import { IAdmin } from "@/app/models/admin";
import Admin from "@/app/models/admin";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password} = await req.json();

    // Check if Admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 400 });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin 
    const newAdmin: IAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: "Admin", 
    });

    await newAdmin.save();

    return NextResponse.json({
      message: "Admin created successfully",
      vendor: { 
        id: (newAdmin._id as Types.ObjectId).toString(),
        name: newAdmin.name,
        email: newAdmin.email,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating Admin:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
