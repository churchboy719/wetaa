// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/options";
// import Vendor from "@/app/models/Vendor";
// import mongoose from "mongoose";

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user || session.user.role !== "vendor") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { vendorId, canPostSales } = await req.json();

//     if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
//       return NextResponse.json({ error: "Invalid Vendor ID" }, { status: 400 });
//     }

//     const updatedVendor = await Vendor.findByIdAndUpdate(
//       vendorId,
//       { canPostSales },
//       { new: true }
//     );

//     if (!updatedVendor) {
//       return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
//     }

//     return NextResponse.json({ 
//       message: "Vendor permissions updated successfully", 
//       canPostSales: updatedVendor.canPostSales 
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Error updating vendor permissions:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Your logic here
    return NextResponse.json({ canPost: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}