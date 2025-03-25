import { NextResponse } from 'next/server';
import Blog from '@/app/models/blog';
import { connectDB } from '@/app/lib/mongodb';

export async function GET() {
  await connectDB();
  const blogs = await Blog.find().sort({ date: -1 });
  return NextResponse.json(blogs);
}

