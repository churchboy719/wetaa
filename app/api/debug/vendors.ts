import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Vendor from "@/app/models/vendor";

export async function GET() {
  await connectDB();
  const vendors = await Vendor.find({});
  return NextResponse.json({ vendors });
}
