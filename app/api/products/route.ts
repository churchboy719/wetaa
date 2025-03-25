// import { NextResponse } from "next/server";
// import { createClient } from "@sanity/client";

// const client = createClient({
//   projectId: "your_project_id", 
//   dataset: "production",
//   useCdn: true, 
//   apiVersion: "2023-01-01",
// });

// export async function GET() {
//   const products = await client.fetch('*[_type == "product"]');
//   return NextResponse.json({ products });
// }

// api/products/route.ts


// import { NextResponse } from 'next/server';
// import { connectDB } from '@/app/lib/mongodb';
// import Product from '@/app/models/product';

// export async function POST(req: Request) {
//   await connectDB();
//   const { name, description, category, price, images, discount, nicks, vendorId } = await req.json();

//   if (!name || !description || !category || !price || !images || !nicks || !vendorId) {
//     return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
//   }

//   const product = new Product({ name, description, category, price, images, discount, nicks, vendorId });
//   await product.save();
//   return NextResponse.json({ message: 'Product added successfully', product }, { status: 201 });
// }


// DELETE and PATCH (update) can be implemented similarly
// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/lib/mongodb';
import Product from '@/app/models/product';
import multer from 'multer';
import mongoose from 'mongoose';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

function bufferToBase64(buffer: Buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export async function POST(req: Request) {
  await connectDB();

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount = (formData.get('discount') as string) || '';
    const vendorId = formData.get('vendorId') as string;
    const nicks = JSON.parse(formData.get('nicks') as string);

    if (!name || !description || !category || isNaN(price) || !vendorId || !nicks.length) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const images: string[] = [];

    for (const entry of formData.entries()) {
      const [key, value] = entry;
      if (key === 'images' && value instanceof Blob) {
        const buffer = Buffer.from(await value.arrayBuffer());
        const mimeType = value.type || 'image/png';

        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(mimeType)) {
          return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
        }

        const base64 = `data:${mimeType};base64,${buffer.toString('base64')}`;
        images.push(base64);
      }
    }

    const product = new Product({ name, description, category, price, images, discount, nicks, vendorId });
    await product.save();

    return NextResponse.json({ message: 'Product added successfully', product }, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}


export async function GET() {
  await connectDB();
  try {
    const products = await Product.find({});
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
