// import { NextResponse } from "next/server";
// import { connectDB } from "@/app/lib/mongodb";
// import Product from "@/app/models/product";

// // Update Product
// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   await connectDB();

//   try {
//     const id = params.id;
//     const updates = await req.json();

//     const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

//     if (!updatedProduct) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json(updatedProduct, { status: 200 });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

// // Delete Product
// export async function DELETE(req: Request, { params }: { params: { id: string } }) {
//   await connectDB();

//   try {
//     const id = params.id;

//     const deletedProduct = await Product.findByIdAndDelete(id);

//     if (!deletedProduct) {
//       return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     }

//     return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Product from "@/app/models/product";

// Get Product
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Update Product
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();
    const updates = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Delete Product
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await connectDB();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
