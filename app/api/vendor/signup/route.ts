// // import { NextResponse } from "next/server";
// // import bcrypt from "bcryptjs";
// // import Vendor from "@/app/models/vendor";
// // import { connectDB } from "@/app/lib/mongodb";

// // export async function POST(req: Request) {
// //   try {
// //     await connectDB();
// //     const { fullName, email, password, businessAddress, phone, packageType, voucherCode } = await req.json();

// //     const amountPaid = packageType === "Premium" ? 100 : 50; // Example pricing
    
// //     const existingVendor = await Vendor.findOne({ email });
// //     if (existingVendor) {
// //       return NextResponse.json({ error: "Vendor already exists" }, { status: 400 });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const newVendor = new Vendor({
// //       fullName,
// //       email,
// //       password: hashedPassword,
// //       businessAddress,
// //       phone,
// //       packageType,
// //       amountPaid,
// //       voucherCode,
// //     });
// //     await newVendor.save();

// //     return NextResponse.json({ message: "It was successful" }, { status: 201 });
// //   } catch (error) {
// //     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
// //   }
// // }

// import { NextResponse } from "next/server";
// import bcrypt from "bcryptjs";
// import Vendor from "@/app/models/vendor";
// import { connectDB } from "@/app/lib/mongodb";

// export async function POST(req: Request) {
//   try {
//     console.log("Connecting to database...");
//     await connectDB();
//     console.log("DB Connected!");

//     const { fullName, email, password, businessAddress, phone, packageType, voucherCode } = await req.json();
//     console.log("Received request body:", { fullName, email, packageType });

//     const amountPaid = packageType === "Premium" ? 100 : 50;
    
//     console.log("Checking if vendor exists...");
//     const existingVendor = await Vendor.findOne({ email });
//     if (existingVendor) {
//       console.log("Vendor already exists!");
//       return NextResponse.json({ error: "Vendor already exists" }, { status: 400 });
//     }

//     console.log("Hashing password...");
//     const hashedPassword = await bcrypt.hash(password, 10);
//     console.log("Password hashed successfully.");

//     const newVendor = new Vendor({
//       fullName,
//       email,
//       password: hashedPassword,
//       businessAddress,
//       phone,
//       packageType,
//       amountPaid,
//       voucherCode,
//     });

//     console.log("Saving new vendor to the database...");
//     await newVendor.save();
//     console.log("Vendor saved successfully!");

//     return NextResponse.json({ message: "Vendor registered successfully" }, { status: 201 });
//   } catch (error:any) {
//     console.error("Error during vendor registration:", error);
//     return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Vendor from "@/app/models/vendor";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    console.log("Connecting to database...");
    await connectDB();

    const { name, businessName, address, businessType, email, password, phone, packageType, voucherCode } = await req.json();
    
    if (!name || !businessName || !address || !businessType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const amountPaid = packageType === "Premium" ? 100 : 50;
    
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = new Vendor({
      name,
      businessName,
      address,
      businessType,
      email,
      password: hashedPassword,
      phone,
      packageType,
      amountPaid,
      voucherCode,
    });

    await newVendor.save();

    return NextResponse.json({ message: "Vendor registered successfully" }, { status: 201 });
  } catch (error:any) {
    console.error("Error during vendor registration:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
